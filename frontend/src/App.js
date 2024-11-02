import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Desaparecidos from './pages/Desaparecidos';
import PuntosDeAyuda from './pages/PuntosDeAyuda';
import './static/css/style.css';
import logo from './images/logo.jpeg';
import xlogo from './images/xlogo.png';

function App() {
    return (
        <Router>
            <div className="App">
                {/* Barra de navegación */}
                <nav className="navbar">
                    <Link to="/">
                        <img src={logo} alt="Logo de DANAInfo" className="navbar-logo" />
                    </Link>
                    <h1 className="navbar-brand">
                        <span className="navbar-title">DANAInfo</span>
                    </h1>
                    <ul className="navbar-nav">
                        <li className="nav-item"><Link to="/">Inicio</Link></li>
                        <li className="nav-item"><Link to="/desaparecidos" className="desaparecidos-button">Desaparecidos</Link></li>
                        <li className="nav-item"><Link to="/PuntosDeAyuda">Puntos de ayuda</Link></li>
                    </ul>
                    <a href="https://twitter.com/intent/tweet?text=Por%20favor%20compartid%20esta%20web%20para%20informar%20sobre%20la%20DANA" target="_blank" rel="noopener noreferrer">
                        <img src={xlogo} alt="Logo de X" className="navbar-xlogo" />
                    </a>
                </nav>

                {/* Rutas de la aplicación */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/PuntosDeAyuda" element={<PuntosDeAyuda />} />
                    <Route path="/desaparecidos" element={<Desaparecidos />} />
                </Routes>

                {/* Footer */}
                <footer className="footer">
                    <p>&copy; 2024 DANAinfo. Todos los derechos reservados.</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
