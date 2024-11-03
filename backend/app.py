from flask import Flask, jsonify, request, send_from_directory
import base64
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import re
import threading
import json
import os
import time

load_dotenv()  # Load environment variables
MONGODB_URI = os.getenv("MONGODB_URI")

app = Flask(__name__, static_folder='static/build')  # Updated static folder
CORS(app)  # Enable CORS

# Connect to MongoDB Atlas
client = MongoClient(MONGODB_URI)
db = client['danainfo']  # Database name
collection = db['desaparecidos']  # Collection for missing persons data

# Path to the JSON file storing fallecidos data
data_file = 'fallecidos_data.json'

# Web scraper function to update fallecidos data
def scrape_fallecidos():
    url = 'https://cnnespanol.cnn.com/2024/11/01/noticias-dana-tormentas-valencia-muertos-espana-orix-2/'

    while True:
        try:
            response = requests.get(url)
            max_fallecidos = 0

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                paragraphs = soup.find_all('p')

                for paragraph in paragraphs:
                    if 'fallecidos' in paragraph.text:
                        match = re.search(r'(\d+)', paragraph.text)
                        if match:
                            num_fallecidos = int(match.group(0))
                            if num_fallecidos > max_fallecidos:
                                max_fallecidos = num_fallecidos

                # Write the updated data to the JSON file
                with open(data_file, 'w') as f:
                    json.dump({"fallecidos": max_fallecidos}, f)
                print(f"Updated fallecidos: {max_fallecidos}")

            else:
                print(f"Error accessing the page: {response.status_code}")

        except Exception as e:
            print(f"Error during scraping: {e}")

        # Wait for 3 minutes before scraping again
        time.sleep(180)

# Start the scraper function in a separate thread
threading.Thread(target=scrape_fallecidos, daemon=True).start()

# Endpoint to serve React's index.html
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# Test DB Connection Endpoint
@app.route('/test-db-connection', methods=['GET'])
def test_db_connection():
    try:
        # Intenta contar los documentos como prueba de conexión
        count = collection.count_documents({})
        return jsonify({"status": "success", "count": count}), 200
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 503

# News API route for centralized news handling
@app.route('/news', methods=['GET'])
def get_news():
    try:
        response = requests.get(
            'https://newsapi.org/v2/everything?q=DANA+valencia&apiKey=e0fa1fbb58c84981bb65ac4b7451fc21'
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to retrieve the number of fallecidos
@app.route('/fallecidos', methods=['GET'])
def get_fallecidos():
    if os.path.exists(data_file):
        with open(data_file, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify({'error': 'Data not available'}), 404

# Endpoint to retrieve missing persons data with pagination
@app.route('/desaparecidos', methods=['GET'])
def get_desaparecidos():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 6))
    skip = (page - 1) * limit
    
    total_count = collection.count_documents({})
    desaparecidos = list(
        collection.find({}, {'_id': 0})
        .skip(skip)
        .limit(limit)
    )
    
    return jsonify({
        'desaparecidos': desaparecidos,
        'total_count': total_count
    })

# Get desaparecidos count
@app.route('/desaparecidos/count', methods=['GET'])
def get_desaparecidos_count():
    count = collection.count_documents({})
    return jsonify({'count': count})

# Add a new missing person report with image
@app.route('/desaparecidos', methods=['POST'])
def add_desaparecido():
    nombre = request.form['nombre']
    ubicacion = request.form['ubicacion']
    detalles = request.form['detalles']
    fecha = request.form['fecha']
    
    # Convert image to base64
    imagen = request.files['imagen']
    imagen_base64 = base64.b64encode(imagen.read()).decode('utf-8') if imagen else None

    nuevo_desaparecido = {
        "nombre": nombre,
        "ubicacion": ubicacion,
        "detalles": detalles,
        "fecha": fecha,
        "imagen": imagen_base64
    }

    # Insert into the collection
    result = collection.insert_one(nuevo_desaparecido)
    nuevo_desaparecido["_id"] = str(result.inserted_id)

    return jsonify(nuevo_desaparecido), 201

if __name__ == '__main__':
    app.run(debug=False)