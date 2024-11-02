import requests
from bs4 import BeautifulSoup
import re
import time

url = 'https://cnnespanol.cnn.com/2024/11/01/noticias-dana-tormentas-valencia-muertos-espana-orix-2/'

while True:  # Comienza un bucle infinito
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

        print(f"Número máximo de fallecidos: {max_fallecidos}")

    else:
        print(f"Error al acceder a la página: {response.status_code}")

    time.sleep(180)  # Pausa por 180 segundos antes de la próxima verificación

