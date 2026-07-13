
function nombreRol(idRol) {
  if (idRol === 1) return 'Paciente';
  if (idRol === 2) return 'Psicólogo';
  if (idRol === 3) return 'Administrador';
  return 'Usuario';
}

function cerrarSesionLocal() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

function renderNav() {
  const usuarioGuardado = localStorage.getItem('usuario');
  const nav = document.getElementById('main-nav');

  if (!nav || !usuarioGuardado) return;

  let usuario;

  try {
    usuario = JSON.parse(usuarioGuardado);
  } catch (error) {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }

  let links = '';

  if (usuario.id_rol === 1) {
    links = `
      <a href="foro.html">Foro</a>
      <a href="agenda.html">Agenda</a>
      <a href="postulacion-psicologo.html">Postular a Psicólogo</a>
    `;
  } else if (usuario.id_rol === 2) {
    links = `
      <a href="foro.html">Foro</a>
      <a href="agenda.html">Agenda</a>
    `;
  } else if (usuario.id_rol === 3) {
    links = `
      <a href="admin.html">Administración</a>
    `;
  }

  nav.innerHTML = `
    <div class="nav-usuario">
      <span>${usuario.nombre}</span>
      <small>${nombreRol(usuario.id_rol)}</small>
    </div>
    <div class="nav-links">
      ${links}
      <button id="btn-logout" type="button">Cerrar sesión</button>
    </div>
  `;

  document.getElementById('btn-logout')?.addEventListener('click', cerrarSesionLocal);
}