const sesion = requerirSesion();

if (sesion) {
  renderNav();

  const contenedor = document.getElementById('publicaciones');

  function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function renderCargandoPublicaciones() {
    contenedor.innerHTML = `
      <div class="estado estado-cargando">
        <p>Cargando publicaciones...</p>
      </div>
    `;
  }

  function renderVacioPublicaciones() {
    contenedor.innerHTML = `
      <div class="estado estado-vacio">
        <h3>Aún no hay publicaciones</h3>
        <p>Comparte la primera reflexión o tema para iniciar la conversación.</p>
      </div>
    `;
  }

  function renderErrorPublicaciones() {
    contenedor.innerHTML = `
      <div class="estado estado-error">
        <h3>No se pudieron cargar las publicaciones</h3>
        <p>Verifica la conexión con el servidor e intenta nuevamente.</p>
      </div>
    `;
  }

  async function cargarPublicaciones() {
    renderCargandoPublicaciones();

    try {
      const respuesta = await fetch(`${API_URL}/forum`);
      const publicaciones = await respuesta.json();

      if (!respuesta.ok) {
        renderErrorPublicaciones();
        return;
      }

      if (!publicaciones.length) {
        renderVacioPublicaciones();
        return;
      }

      contenedor.innerHTML = publicaciones.map(pub => `
        <article class="tarjeta-publicacion" onclick="window.location.href='publicacion.html?id=${pub.id_publicacion}'">
          <h3>${escaparHTML(pub.titulo)}</h3>
          <p>${escaparHTML(pub.contenido.substring(0, 150))}${pub.contenido.length > 150 ? '...' : ''}</p>
          <div class="meta-publicacion">
            <span>Por ${escaparHTML(pub.autor)}</span>
            <span>${pub.total_comentarios} comentario(s)</span>
          </div>
        </article>
      `).join('');
    } catch (error) {
      renderErrorPublicaciones();
    }
  }

  document.getElementById('form-publicacion').addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMensaje('mensaje-publicacion');

    const datos = {
      titulo: document.getElementById('titulo').value.trim(),
      contenido: document.getElementById('contenido').value.trim()
    };

    try {
      const respuesta = await fetch(`${API_URL}/forum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sesion.token}`
        },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        mostrarMensaje('mensaje-publicacion', resultado.message || 'No se pudo crear la publicación.', 'error');
        return;
      }

      mostrarMensaje('mensaje-publicacion', 'Publicación creada exitosamente.', 'exito');
      document.getElementById('form-publicacion').reset();
      cargarPublicaciones();
    } catch (error) {
      mostrarMensaje('mensaje-publicacion', 'No se pudo conectar con el servidor.', 'error');
    }
  });

  cargarPublicaciones();
}