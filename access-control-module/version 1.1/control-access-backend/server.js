// Importar Express y MySQL
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
app.use(express.json()); // Para procesar JSON
app.use(cors()); // Para evitar errores de CORS


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


db.connect(err => {
    if (err) {
        console.error('❌ Error de conexión a MySQL:', err);
        return;
    }
    console.log('✅ Conectado a MySQL');
});


app.post('/users', (req, res) => {
    const { name, password, permissions } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: 'Nombre y contraseña son obligatorios' });
    }

    const query = 'INSERT INTO users (name, password) VALUES (?, ?)';
    
    db.query(query, [name, password], (err, result) => {
        if (err) {
            console.error('❌ Error al insertar usuario:', err);
            return res.status(500).json({ error: 'Error al guardar el usuario' });
        }

        const userId = result.insertId;

        if (permissions && permissions.length > 0) {
            // Asignar permisos al usuario
            permissions.forEach(permission => {
                const permissionQuery = 'INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)';
                db.query(permissionQuery, [userId, permission], (err) => {
                    if (err) {
                        console.error('❌ Error al asignar permisos:', err);
                        return res.status(500).json({ error: 'Error al asignar permisos al usuario' });
                    }
                });
            });
        }

        res.json({ message: '✅ Usuario agregado', id: userId });
    });
});


app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000');
});
