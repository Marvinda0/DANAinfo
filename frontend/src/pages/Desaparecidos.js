import React, { useState } from 'react';

function Desaparecidos() {
    const [desaparecidos, setDesaparecidos] = useState([]);
    const [nombre, setNombre] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [detalles, setDetalles] = useState('');
    const [fechaVisto, setFechaVisto] = useState('');
    const [imagen, setImagen] = useState(null);

    // Maneja el cambio en el archivo de imagen
    const handleImageChange = (e) => {
        setImagen(e.target.files[0]);
    };

    // Agregar un nuevo cartel de búsqueda
    const handleSubmit = (e) => {
        e.preventDefault();

        // Crear un nuevo objeto de desaparecido
        const nuevoDesaparecido = {
            nombre,
            ubicacion,
            detalles,
            fechaVisto,
            imagen: URL.createObjectURL(imagen) // Almacenar la URL de la imagen cargada
        };

        // Actualizar el estado
        setDesaparecidos([...desaparecidos, nuevoDesaparecido]);

        // Limpiar el formulario
        setNombre('');
        setUbicacion('');
        setDetalles('');
        setFechaVisto('');
        setImagen(null);
    };

    return (
        <div className="desaparecidos-page">
            <h1>Desaparecidos</h1>
            <p>Aquí puedes reportar personas desaparecidas.</p>

            {/* Formulario para agregar un desaparecido */}
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </label>
                <label>
                    Última Ubicación:
                    <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} required />
                </label>
                <label>
                    Detalles:
                    <textarea value={detalles} onChange={(e) => setDetalles(e.target.value)} required />
                </label>
                <label>
                    Fecha última vez visto:
                    <input type="date" value={fechaVisto} onChange={(e) => setFechaVisto(e.target.value)} required />
                </label>
                <label>
                    Imagen:
                    <input type="file" onChange={handleImageChange} accept="image/*" required />
                </label>
                <button type="submit">Agregar Desaparecido</button>
            </form>

            {/* Lista de carteles de desaparecidos */}
            <div className="carteles-desaparecidos">
                {desaparecidos.map((persona, index) => (
                    <div key={index} className="cartel">
                        {persona.imagen && <img src={persona.imagen} alt={`Imagen de ${persona.nombre}`} />}
                        <h3>{persona.nombre}</h3>
                        <p><strong>Última Ubicación:</strong> {persona.ubicacion}</p>
                        <p><strong>Fecha última vez visto:</strong> {persona.fechaVisto}</p>
                        <p><strong>Detalles:</strong> {persona.detalles}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Desaparecidos;
