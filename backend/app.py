from flask import Flask, jsonify, request
import requests
from bs4 import BeautifulSoup
import re
from pymongo import MongoClient
from flask_cors import CORS
import config  # Asegúrate de tener config.py con el URI de MongoDB
import base64

app = Flask(__name__)
CORS(app)  # Permitir solicitudes de CORS

# Conectar a MongoDB Atlas
client = MongoClient(config.MONGODB_URI)
db = client['danainfo']  # Nombre de la base de datos
collection = db['desaparecidos']  # Nombre de la colección para los carteles de personas desaparecidas

# Endpoint para obtener el número de fallecidos (scraping)
@app.route('/fallecidos', methods=['GET'])
def get_fallecidos():
    url = 'https://cnnespanol.cnn.com/2024/11/01/noticias-dana-tormentas-valencia-muertos-espana-orix-2/'
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

        return jsonify({'fallecidos': max_fallecidos})

    return jsonify({'error': 'Error al acceder a la página'}), 500

# Endpoint para obtener todos los carteles de personas desaparecidas
@app.route('/desaparecidos', methods=['GET'])
def get_desaparecidos():
    desaparecidos = list(collection.find({}, {'_id': 0}))  # Excluir el campo _id para simplificar
    return jsonify(desaparecidos)

# Endpoint para agregar un nuevo cartel de persona desaparecida, incluyendo imagen
@app.route('/desaparecidos', methods=['POST'])
def add_desaparecido():
    nombre = request.form['nombre']
    ubicacion = request.form['ubicacion']
    detalles = request.form['detalles']
    fecha = request.form['fecha']
    
    # Convertir la imagen en base64
    imagen = request.files['imagen']
    imagen_base64 = base64.b64encode(imagen.read()).decode('utf-8') if imagen else None

    nuevo_desaparecido = {
        "nombre": nombre,
        "ubicacion": ubicacion,
        "detalles": detalles,
        "fecha": fecha,
        "imagen": imagen_base64
    }

    # Insertar en la colección
    result = collection.insert_one(nuevo_desaparecido)

    # Agregar el ID en formato de cadena al objeto
    nuevo_desaparecido["_id"] = str(result.inserted_id)

    return jsonify(nuevo_desaparecido), 201

if __name__ == '__main__':
    app.run(debug=True)