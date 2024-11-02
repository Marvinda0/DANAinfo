from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup
import re
import time
from flask_cors import CORS


app = Flask(__name__)
CORS(app)  # Permitir solicitudes de CORS

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

if __name__ == '__main__':
    app.run(debug=True)