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

app = Flask(__name__, static_folder='static/build')
CORS(app)  # Enable CORS

# Connect to MongoDB Atlas
client = MongoClient(MONGODB_URI)
db = client['danainfo']  # Database name
collection = db['desaparecidos']  # Collection for missing persons data

# Path to the JSON file storing fallecidos data
data_file = 'fallecidos_data.json'

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

# Web scraper function to update fallecidos data
def scrape_fallecidos():
    url = 'https://elpais.com/espana/2024-11-03/ultima-hora-de-la-dana-en-directo.html'

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

                with open(data_file, 'w') as f:
                    json.dump({"fallecidos": max_fallecidos}, f)
                print(f"Updated fallecidos: {max_fallecidos}")

            else:
                print(f"Error accessing the page: {response.status_code}")

        except Exception as e:
            print(f"Error during scraping: {e}")

        time.sleep(180)

threading.Thread(target=scrape_fallecidos, daemon=True).start()

# API endpoints for data
@app.route('/api/test-db-connection', methods=['GET'])
def test_db_connection():
    try:
        count = collection.count_documents({})
        return jsonify({"status": "success", "count": count}), 200
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 503

@app.route('/api/news', methods=['GET'])
def get_news():
    api_key = 'jQD00NKnInedCYwGJPrTkLj7Uj0SKnH4HkOi2SS0'
    try:
        response = requests.get(
            f'https://api.thenewsapi.com/v1/news/all?api_token={api_key}&language=es&search=DANA+valencia'
        )
        data = response.json()
        if 'data' in data:
            return jsonify({"articles": data['data']}), response.status_code
        else:
            return jsonify({"articles": []}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/fallecidos', methods=['GET'])
def get_fallecidos():
    if os.path.exists(data_file):
        with open(data_file, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify({'error': 'Data not available'}), 404

@app.route('/api/desaparecidos', methods=['GET'])
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

@app.route('/api/desaparecidos/count', methods=['GET'])
def get_desaparecidos_count():
    count = collection.count_documents({})
    return jsonify({'count': count})

@app.route('/api/desaparecidos', methods=['POST'])
def add_desaparecido():
    nombre = request.form['nombre']
    ubicacion = request.form['ubicacion']
    detalles = request.form['detalles']
    fecha = request.form['fecha']
    
    imagen = request.files['imagen']
    imagen_base64 = base64.b64encode(imagen.read()).decode('utf-8') if imagen else None

    nuevo_desaparecido = {
        "nombre": nombre,
        "ubicacion": ubicacion,
        "detalles": detalles,
        "fecha": fecha,
        "imagen": imagen_base64
    }

    result = collection.insert_one(nuevo_desaparecido)
    nuevo_desaparecido["_id"] = str(result.inserted_id)

    return jsonify(nuevo_desaparecido), 201

# Serve React app for all other routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=False)
