
// Registro

const formRegistro = document.getElementById('form-registro');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('mensaje-registro');

    const datos = {
      nombre: document.getElementById('nombre').value,
      correo: document.getElementById('correo').value,
      contrasena: document.getElementById('contrasena').value
    };

    try {
      const respuesta = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        mensaje.textContent = resultado.message;
        mensaje.className = 'error';
        return;
      }

      mensaje.textContent = 'Cuenta creada exitosamente. Redirigiendo al login...';
      mensaje.className = 'exito';
      setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (error) {
      mensaje.textContent = 'No se pudo conectar con el servidor.';
      mensaje.className = 'error';
    }
  });
}

// Login

const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('mensaje-login');

    const datos = {
      correo: document.getElementById('correo').value,
      contrasena: document.getElementById('contrasena').value
    };

    try {
      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        mensaje.textContent = resultado.message;
        mensaje.className = 'error';
        return;
      }

      // Aqui se guardara el token y los datos del usuario para usarlo en otras páginas.

      localStorage.setItem('token', resultado.token);
      localStorage.setItem('usuario', JSON.stringify(resultado.usuario));

      // Redirigir según el rol.

      const id_rol = resultado.usuario.id_rol;
      if (id_rol === 1) window.location.href = 'foro.html';
      else if (id_rol === 2) window.location.href = 'agenda.html';
      else if (id_rol === 3) window.location.href = 'admin.html';

    } catch (error) {
      mensaje.textContent = 'No se pudo conectar con el servidor.';
      mensaje.className = 'error';
    }
  });
}