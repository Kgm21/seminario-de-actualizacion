const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());
app.use(cors({
    exposedHeaders: ['Authorization']
}));

const SECRET_KEY = 'your_secret_key';

// Base de datos simulada con usuarios
const users = [
    { id: 'user123', password: '$2b$10$tHChtSnYwOCZPNI3B3TwUOwRAi2biki6m5vV7XkcrF6HnuAsgGWkS', roles: ['admin'] }, // Contraseña: 'password123'
    { id: 'user456', password: '$2b$10$FnNbFqOFWwZVyTP3gmfUVeqyuQebzMqvr4NmOacSPiJBd2V/EeI/e', roles: ['user'] }  // Contraseña: 'password456'
];


// Generar token
function generateToken(user, lastActivityTime = Date.now()) {
    const payload = { userId: user.id, roles: user.roles, lastActivityTime };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

// Ruta de login
app.post('/login', async (req, res) => {
    const { userId, password } = req.body;
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generateToken(user);
    res.json({ sessionKey: token, roles: user.roles });
});

// Middleware de autenticación
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ error: '❌ No estás autenticado.' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: '❌ Token inválido o expirado.' });
        }

        const currentTime = Date.now();
        const lastActivityTime = decoded.lastActivityTime || currentTime;

        if (currentTime - lastActivityTime > 10 * 60 * 1000) {
            return res.status(401).json({ error: '❌ Sesión expirada por inactividad.' });
        }

        decoded.lastActivityTime = currentTime;
        const newToken = generateToken(decoded, currentTime);
        res.setHeader('Authorization', 'Bearer ' + newToken);

        req.user = decoded;
        next();
    });
}

// Middleware de autorización
function authorize(role) {
    return (req, res, next) => {
        if (req.user && req.user.roles.includes(role)) {
            return next();
        } else {
            return res.status(403).json({ error: '❌ No tienes permiso para acceder a esta ruta.' });
        }
    };
}

// Ruta protegida (solo para admins)
app.get('/protected', authenticate, authorize('admin'), (req, res) => {
    res.setHeader('Authorization', 'Bearer ' + req.headers['authorization'].split(' ')[1]);
    res.status(200).json({ message: '✅ Acceso permitido a la ruta protegida' });
});

// Logout
app.post('/logout', (req, res) => {
    res.status(200).json({ message: '✅ Sesión cerrada exitosamente' });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


