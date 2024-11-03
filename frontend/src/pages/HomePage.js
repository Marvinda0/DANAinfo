import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../static/css/style.css';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function HomePage() {
    const [numFallecidos, setNumFallecidos] = useState(0);
    const [numDesaparecidos, setNumDesaparecidos] = useState(0);
    const [news, setNews] = useState([]);

    // Fetch fallecidos data
    useEffect(() => {
        const fetchFallecidos = async () => {
            try {
                const response = await axios.get(`${baseURL}/fallecidos`);
                setNumFallecidos(response.data.fallecidos);
            } catch (error) {
                console.error('Error fetching fallecidos:', error);
            }
        };

        fetchFallecidos();
    }, []);

    // Fetch desaparecidos count
    useEffect(() => {
        const fetchDesaparecidosCount = async () => {
            try {
                const response = await axios.get(`${baseURL}/desaparecidos/count`);
                setNumDesaparecidos(response.data.count);
            } catch (error) {
                console.error('Error fetching desaparecidos count:', error);
            }
        };

        fetchDesaparecidosCount();
    }, []);

    // Fetch news data and refresh every hour
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get(
                    `https://newsapi.org/v2/everything?q=DANA+valencia&apiKey=e0fa1fbb58c84981bb65ac4b7451fc21`
                );
                setNews(response.data.articles);
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        };

        fetchNews();

        const interval = setInterval(fetchNews, 900000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <header className="header">
                <p>Proyecto dedicado a proporcionar información sobre las víctimas de la DANA desde el 2 de noviembre de 2024.</p>
            </header>

            <div className="stats">
                <p><strong>Número de Fallecidos:</strong> <span id="numMuertos">{numFallecidos}</span></p>
                <p className="clarification-text">Cifras provisionales ofrecidas por el Gobierno español este sábado</p> 
                <p><strong>Número de desaparecidos:</strong> <span id="numDesaparecidos">{numDesaparecidos}</span></p>
                <p className="clarification-text">Desaparecidos publicados en esta página web en concreto</p>
            </div>

            <section className="news-section">
                <h3>Noticias Relevantes</h3>
                <ul>
                    {news.slice(0, 5).map((article, index) => (
                        <li key={index} className="news-item">
                            {article.urlToImage && (
                                <img src={article.urlToImage} alt="Imagen de la noticia" className="news-image" />
                            )}
                            <div className="news-content">
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    {article.title}
                                </a>
                                <p>{article.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>  
        </div>
    );
}

export default HomePage;