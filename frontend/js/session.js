
function obtenerSesion() {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  return { token, usuario };
}

function irALogin() {
  window.location.href = 'login.html';
}

function requerirSesion(rolesPermitidos = []) {
  const { token, usuario } = obtenerSesion();

  if (!token || !usuario) {
    irALogin();
    return null;
  }

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.id_rol)) {
    alert('No tienes permisos para acceder a esta página.');
    irALogin();
    return null;
  }

  return { token, usuario };
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  irALogin();
}