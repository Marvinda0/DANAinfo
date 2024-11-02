import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './static/css/style.css';

function App() {
    const [numFallecidos, setNumFallecidos] = useState(0);

    useEffect(() => {
        const fetchFallecidos = async () => {
            try {
                const response = await axios.get('http://localhost:5000/fallecidos');
                setNumFallecidos(response.data.fallecidos);
            } catch (error) {
                console.error('Error fetching fallecidos:', error);
            }
        };

        fetchFallecidos();
    }, []);

    return (
        <div className="App">
            <nav className="navbar">
    <img src="./images/logo.jpeg" alt="Logo de DANAinfo" className="navbar-logo" />
    <ul className="navbar-nav">
        <li className="nav-item"><a href="#">Inicio</a></li>
        <li className="nav-item"><a href="#">Desaparecidos</a></li>
        <li className="nav-item"><a href="#">Puntos de ayuda</a></li>
    </ul>
</nav>

            <header className="header">
                <h2>DANAinfo</h2>
                <p>Proyecto dedicado a proporcionar información sobre víctimas de desastres.</p>
            </header>

            <div className="stats">
                <p><strong>Número de muertos:</strong> <span id="numMuertos">{numFallecidos}</span></p>
                <p><strong>Número de desaparecidos:</strong> <span id="numDesaparecidos">0</span></p>
            </div>

            <footer className="footer">
                <p>&copy; 2024 DANAinfo. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}

export default App;
