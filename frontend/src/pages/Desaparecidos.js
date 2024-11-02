import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Desaparecidos() {
    const [desaparecidos, setDesaparecidos] = useState([]);
    const [nombre, setNombre] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [detalles, setDetalles] = useState('');
    const [fecha, setFecha] = useState('');
    const [imagen, setImagen] = useState(null);  // Nuevo estado para la imagen
    const [mensaje, setMensaje] = useState('');

    // Cargar la lista de desaparecidos al montar el componente
    useEffect(() => {
        const fetchDesaparecidos = async () => {
            try {
                const response = await axios.get('http://localhost:5000/desaparecidos');
                setDesaparecidos(response.data);
            } catch (error) {
                console.error('Error al cargar desaparecidos:', error);
            }
        };

        fetchDesaparecidos();
    }, []);

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("ubicacion", ubicacion);
        formData.append("detalles", detalles);
        formData.append("fecha", fecha);
        formData.append("imagen", imagen);  // Adjuntar la imagen

        try {
            const response = await axios.post('http://localhost:5000/desaparecidos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                setDesaparecidos([...desaparecidos, response.data]);  // Agregar el nuevo desaparecido a la lista
                setMensaje("Desaparecido agregado correctamente");
                // Limpiar el formulario
                setNombre('');
                setUbicacion('');
                setDetalles('');
                setFecha('');
                setImagen(null);
            } else {
                setMensaje("Error al agregar desaparecido");
            }
        } catch (error) {
            console.error('Error al agregar desaparecido:', error);
            setMensaje("Error al agregar desaparecido. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="desaparecidos-container">
            <h2>Personas Desaparecidas</h2>
            
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
                    onChange={(e) => setImagen(e.target.files[0])}  // Manejar el archivo de imagen
                />
                
                <button type="submit">Agregar Desaparecido</button>
            </form>

            <div className="desaparecidos-list">
                {desaparecidos.map((persona, index) => (
                    <div key={index} className="desaparecido-card">
                        <h3>{persona.nombre}</h3>
                        <p><strong>Ubicación:</strong> {persona.ubicacion}</p>
                        <p><strong>Detalles:</strong> {persona.detalles}</p>
                        <p><strong>Fecha:</strong> {persona.fecha}</p>
                        {persona.imagen && <img src={`data:image/jpeg;base64,${persona.imagen}`} alt="Desaparecido" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Desaparecidos;
