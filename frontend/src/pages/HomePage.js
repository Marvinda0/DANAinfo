import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../static/css/style.css';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function HomePage() {
    const [numFallecidos, setNumFallecidos] = useState(0);
    const [numDesaparecidos, setNumDesaparecidos] = useState(0);
    const [news, setNews] = useState([]);

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

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/news`);
                setNews(response.data.articles || []);
            } catch (error) {
                console.error('Error fetching news:', error);
                setNews([]);
            }
        };

        fetchNews();

        const interval = setInterval(fetchNews, 900000); // 15-minute interval
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <header className="header">
                <p>Proyecto dedicado a proporcionar información sobre las víctimas de la DANA desde el 2 de noviembre de 2024.</p>
            </header>

            <div className="stats">
                <p><strong>Número de Fallecidos:</strong> <span id="numMuertos">{numFallecidos}</span></p>
                <p className="clarification-text">Cifras provisionales ofrecidas por el Gobierno español</p> 
                <p><strong>Número de desaparecidos:</strong> <span id="numDesaparecidos">{numDesaparecidos}</span></p>
                <p className="clarification-text">Desaparecidos publicados en esta página web en concreto</p>
            </div>

            <section className="news-section">
                <h3>Noticias Relevantes</h3>
                <ul>
                    {news.length > 0 ? (
                        news.slice(0, 5).map((article, index) => (
                            <li key={index} className="news-item">
                                {article.image_url && (
                                    <img src={article.image_url} alt="Imagen de la noticia" className="news-image" />
                                )}
                                <div className="news-content">
                                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                                        {article.title}
                                    </a>
                                    <p>{article.description}</p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p>No hay noticias disponibles en este momento.</p>
                    )}
                </ul>
            </section>  
        </div>
    );
}

export default HomePage;