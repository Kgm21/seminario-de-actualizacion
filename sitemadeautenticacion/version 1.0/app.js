const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Middlewares
app.use(express.json());
app.use(cors()); 

const SECRET_KEY = 'your_secret_key'; 

// Simulamos usuarios
const users = [
    { id: 'user123', password: 'password123', roles: ['admin'] },
    { id: 'user456', password: 'password456', roles: ['user'] }
];

// Función para generar el token
function generateToken(user) {
    const payload = { userId: user.id, roles: user.roles };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

// Ruta de login
app.post('/login', (req, res) => {
    const { userId, password } = req.body;

    const user = users.find(u => u.id === userId && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.status(200).json({ sessionKey: token });
});

// Middleware de autenticación
function authenticate(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token is invalid' });
        }
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
            return res.status(403).json({ error: 'Not authorized' });
        }
    };
}


// Ruta protegida
app.get('/protected', authenticate, authorize('admin'), (req, res) => {
    res.status(200).json({ message: 'You have access to this route' });
});

// Ruta logout (en este caso, solo un ejemplo básico)
app.post('/logout', (req, res) => {
    // Normalmente borrarías la sesión del usuario aquí, pero con JWT no es necesario
    res.status(200).json({ message: 'Logged out successfully' });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
