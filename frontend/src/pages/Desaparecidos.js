import React, { useEffect, useState } from 'react';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Desaparecidos() {
    const [desaparecidos, setDesaparecidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nombre, setNombre] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [detalles, setDetalles] = useState('');
    const [fecha, setFecha] = useState('');
    const [imagen, setImagen] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const limit = 6;

    useEffect(() => {
        const fetchDesaparecidos = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${baseURL}/desaparecidos?page=${page}&limit=${limit}`);
                setDesaparecidos(response.data.desaparecidos);
                setTotalCount(response.data.total_count);
            } catch (error) {
                console.error('Error al cargar desaparecidos:', error);
                setMensaje('Error al cargar datos. Inténtalo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchDesaparecidos();
    }, [page]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("ubicacion", ubicacion);
        formData.append("detalles", detalles);
        formData.append("fecha", fecha);
        formData.append("imagen", imagen);

        try {
            const response = await axios.post(`${baseURL}/desaparecidos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                alert("Agregado correctamente.");
                setMensaje("Desaparecido agregado correctamente");
                setNombre('');
                setUbicacion('');
                setDetalles('');
                setFecha('');
                setImagen(null);
                setPage(1);
            } else {
                setMensaje("Error al agregar desaparecido");
            }
        } catch (error) {
            console.error('Error al agregar desaparecido:', error);
            setMensaje("Error al agregar desaparecido. Inténtalo de nuevo.");
        }
    };

    const totalPages = Math.ceil(totalCount / limit);

    const filteredDesaparecidos = desaparecidos.filter(persona =>
        persona.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="desaparecidos-container">
            <h2>Personas Desaparecidas</h2>
            <p>Por favor, completa los siguientes campos para reportar una persona desaparecida. Proporciona detalles claros y una imagen reciente si es posible.</p>
            <p>A continuación encontrarás una lista de personas desaparecidas. Si tienes información, llama al <strong>112</strong> por favor.</p>
            {mensaje && <p>{mensaje}</p>}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <label>Nombre:</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
                
                <label>Última Ubicación:</label>
                <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    required
                />
                
                <label>Detalles:</label>
                <textarea
                    value={detalles}
                    onChange={(e) => setDetalles(e.target.value)}
                    placeholder="Proporciona información adicional útil, como características físicas, ropa, etc."
                    required
                />
                
                <label>Fecha:</label>
                <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                />

                <label>Imagen:</label>
                <input
                    type="file"
                    onChange={(e) => setImagen(e.target.files[0])}
                    accept="image/*"
                />
                
                <button type="submit">Agregar Desaparecido</button>
            </form>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Cargando datos, por favor espera...</p>
                </div>
            ) : (
                <div className="desaparecidos-list">
                    {filteredDesaparecidos.map((persona, index) => (
                        <div key={index} className="desaparecido-card">
                            <h3>{persona.nombre}</h3>
                            <p><strong>Ubicación:</strong> {persona.ubicacion}</p>
                            <p><strong>Detalles:</strong> {persona.detalles}</p>
                            <p><strong>Fecha:</strong> {persona.fecha}</p>
                            {persona.imagen && <img src={`data:image/jpeg;base64,${persona.imagen}`} alt="Desaparecido" className="desaparecido-image" />}
                        </div>
                    ))}
                </div>
            )}

            <div className="pagination">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Siguiente</button>
            </div>
        </div>
    );
}

export default Desaparecidos;
