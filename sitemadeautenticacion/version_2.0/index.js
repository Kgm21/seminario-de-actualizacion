const API_URL = 'http://localhost:3000';

// Manejar el login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
    });

    const data = await response.json();
    
    if (response.ok) {
        localStorage.setItem('sessionKey', data.sessionKey);
        document.getElementById('loginStatus').innerText = '✅ Login exitoso!';

        // Mostrar el rol del usuario
        if (Array.isArray(data.roles) && data.roles.length > 0) {
            document.getElementById('userRole').style.display = 'block';
            document.getElementById('role').innerText = data.roles[0];
        } else {
            console.error("El campo 'roles' no existe o está vacío:", data);
        }

        // Ocultar formulario de login
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-block';
    } else {
        localStorage.removeItem('sessionKey');
        document.getElementById('loginStatus').innerText = '❌ ' + (data.error || 'Error desconocido');
    }
});

// Manejar el cierre de sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('sessionKey');
    document.getElementById('loginStatus').innerText = '❌ Has cerrado sesión.';
    document.getElementById('userRole').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
});

// Al cargar la página, verifica si ya hay un token guardado y si es válido
window.onload = async () => {
    const token = localStorage.getItem('sessionKey');

    if (token) {
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));

            document.getElementById('loginStatus').innerText = '✅ Ya estás logueado';
            document.getElementById('userRole').style.display = 'block';
            document.getElementById('role').innerText = decodedToken.roles?.[0] || "Sin rol";

            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'inline-block';

            // Intentar renovar el token automáticamente
            const response = await fetch(`${API_URL}/protected`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const newToken = response.headers.get('Authorization');
                if (newToken) {
                    localStorage.setItem('sessionKey', newToken.split(' ')[1]);
                }
            } else {
                throw new Error('Token inválido o expirado');
            }
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            localStorage.removeItem('sessionKey');
        }
    }
};
