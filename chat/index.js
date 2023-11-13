const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const path = require('path');
const CryptoJS = require('crypto-js');
const cors = require('cors'); // Agrega la importación de cors

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors()); // Habilita cors
app.use(express.static(path.join(__dirname, 'public')));

// Definir el tamaño del IV (Vector de Inicialización)
const ivSize = 128 / 8;

// Inicializar secretKey al inicio del servidor
const secretKey = generateSecretKey();
const claveAlmacenada = secretKey; // Debes tener la clave almacenada de alguna manera

console.log('Clave secreta generada:', secretKey);

// Verificar si las claves son iguales
if (secretKey === claveAlmacenada) {
  console.log('Las claves son iguales.');
} else {
  console.log('Las claves son diferentes.');
}

// Función para generar la clave secreta
function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Definir el conjunto de usuarios conectados y el mapeo de nombres de usuario a ID de socket
const connectedUsers = new Set();
const socketIdMap = new Map();

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  // Solicitar nombre de usuario al principio
  socket.emit('request_username');

  socket.on('username', (username) => {
    socketIdMap.set(username, socket.id);
    socket.username = username;
    connectedUsers.add(username);
    io.emit('update_user_list', Array.from(connectedUsers));
  });

  socket.on('chat message', function (data) {
    console.log('Mensaje recibido:', data);
    const decryptedMessage = decryptMessage(data.message, secretKey);

    // Emitir el mensaje a todos los clientes
    io.emit('chat message', { user: data.user, message: decryptedMessage });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      connectedUsers.delete(socket.username);
      socketIdMap.delete(socket.username);
      io.emit('update_user_list', Array.from(connectedUsers));
    }
    console.log('Usuario desconectado');
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});