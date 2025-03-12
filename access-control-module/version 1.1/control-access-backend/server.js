const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');  // Para el hash de contraseñas
require('dotenv').config(); 

const app = express();
app.use(express.json()); // Para procesar JSON
app.use(cors()); // Para evitar errores de CORS

// Crear la conexión a la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Conexión a la base de datos
db.connect(err => {
    if (err) {
        console.error('❌ Error de conexión a MySQL:', err);
        return;
    }
    console.log('✅ Conectado a MySQL');
});

// Crear usuario
app.post('/users', async (req, res) => { // Agregamos async aquí
    const { name, password, grupo } = req.body;

    if (!name || !password || !grupo) {
        return res.status(400).json({ error: 'Nombre, contraseña y grupo son obligatorios' });
    }

    const queryGroup = 'SELECT id, name_groups FROM `groups` WHERE `name_groups` = ?';
    db.query(queryGroup, [grupo], async (err, groupResults) => { // Agregamos async aquí
        if (err) {
            console.error('Error al consultar el grupo:', err);
            return res.status(500).json({ error: 'Error al consultar el grupo' });
        }

        if (groupResults.length === 0) {
            return res.status(400).json({ error: 'Grupo no válido' });
        }

        const groupId = groupResults[0].id;
        const groupName = groupResults[0].name_groups;

        // Hashear la contraseña antes de insertarla
        const hashedPassword = await bcrypt.hash(password, 10); 

        const query = 'INSERT INTO users (name, password, access_code) VALUES (?, ?, ?)';
        db.query(query, [name, hashedPassword, 'someAccessCode'], (err, result) => { 
            if (err) {
                console.error('Error al insertar usuario:', err);
                return res.status(500).json({ error: 'Error al guardar el usuario' });
            }

            const userId = result.insertId;

            const queryUserGroup = 'INSERT INTO user_groups (users_id, groups_id) VALUES (?, ?)';
            db.query(queryUserGroup, [userId, groupId], (err) => {
                if (err) {
                    console.error('Error al asociar usuario al grupo:', err);
                    return res.status(500).json({ error: 'Error al asociar usuario al grupo' });
                }

                res.json({
                    message: 'Usuario creado y asociado al grupo',
                    id: userId,
                    name: name,
                    nombre_grupo: groupName
                });
            });
        });
    });
});


app.get('/users', (req, res) => {
    const query = `
        SELECT u.id, u.name, u.password, u.access_code, g.name_groups AS group_name
        FROM users u
        LEFT JOIN user_groups ug ON u.id = ug.users_id
        LEFT JOIN \`groups\` g ON ug.groups_id = g.id
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});
app.post('/login', (req, res) => {
    const { name, password } = req.body;

    const query = 'SELECT u.id, u.name, u.password, g.name_groups AS group_name FROM users u LEFT JOIN user_groups ug ON u.id = ug.users_id LEFT JOIN groups g ON ug.groups_id = g.id WHERE u.name = ?';

    db.query(query, [name], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

        const user = results[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, group: user.group_name }, 'secret_key', { expiresIn: '2h' });

        res.json({ message: 'Login exitoso', token });
    });
});
// Iniciar servidor
app.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000');
});
