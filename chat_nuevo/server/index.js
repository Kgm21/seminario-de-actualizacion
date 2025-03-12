import express from 'express';
import logger from 'morgan';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT ?? 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
});

// Conexión a MySQL
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
});

pool.getConnection()
    .then(connection => {
        console.log('Conexión exitosa a la base de datos');
        connection.release();
    })
    .catch(error => {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);  // Salir del proceso si no se puede conectar a la base de datos
    });

    let userCount = 0; 
    io.on('connection', async (socket) => {
        userCount++;
        const userName = `User${userCount}`;
        console.log(`✅ ${userName} se ha conectado`);
    
        // Enviar el nombre de usuario al cliente
        socket.emit('set user', userName);
    
        // 🔹 1️⃣ Enviar historial de mensajes solo al usuario conectado
        try {
            const connection = await pool.getConnection();
            const [messages] = await connection.execute('SELECT * FROM messages ORDER BY created_at ASC');
            connection.release();
            socket.emit('chat history', messages);  // Enviar sólo al socket conectado
        } catch (error) {
            console.error('❌ Error al recuperar el historial de mensajes:', error);
        }
    
        // 🔹 2️⃣ Recibir mensajes y guardarlos en la BD
        socket.on('chat message', async (msg) => {
            io.emit('chat message', msg);  // Enviar mensaje a todos los clientes conectados
            try {
                const connection = await pool.getConnection();
                await connection.execute('INSERT INTO messages (content) VALUES (?)', [msg]);
                connection.release();
            } catch (error) {
                console.error('❌ Error al guardar mensaje:', error);
            }
        });
    
        socket.on('disconnect', () => {
            console.log('❌ Un usuario se ha desconectado');
        });
    });
    

app.use(logger('dev'));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html');
});

server.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
