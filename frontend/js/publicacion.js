
const sesion = requerirSesion([1, 2]);

if (sesion) {
  renderNav();

  const params = new URLSearchParams(window.location.search);
  const idPublicacion = params.get('id');

  const contenedorPost = document.getElementById('detalle-post');
  const listaComentarios = document.getElementById('lista-comentarios');
  const formComentario = document.getElementById('form-comentario');

  if (!contenedorPost || !listaComentarios || !formComentario) {
    console.error('Faltan elementos requeridos en publicacion.html');
  } else if (!idPublicacion) {
    contenedorPost.innerHTML = `
      <div class="panel-header">
        <h2>Publicación no encontrada</h2>
        <p>No se recibió un identificador válido para cargar el contenido.</p>
      </div>
    `;
  } else {
    cargarDetalle();

    formComentario.addEventListener('submit', async (e) => {
      e.preventDefault();
      limpiarMensaje('mensaje-comentario');

      const boton = formComentario.querySelector('button[type="submit"]');
      const textarea = document.getElementById('contenido-comentario');
      const contenido = textarea.value.trim();

      if (!contenido) {
        mostrarMensaje('mensaje-comentario', 'Debes escribir un comentario antes de publicarlo.', 'error');
        return;
      }

      const inicio = Date.now();
      setBotonLoading(boton, true, 'Comentando...');

      try {
        const respuesta = await fetch(`${API_URL}/forum/${idPublicacion}/comentarios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sesion.token}`
          },
          body: JSON.stringify({ contenido })
        });

        const resultado = await respuesta.json();
        await esperarMinimo(inicio, 450);

        if (!respuesta.ok) {
          mostrarMensaje('mensaje-comentario', resultado.message || 'No se pudo agregar el comentario.', 'error');
          return;
        }

        mostrarMensaje('mensaje-comentario', 'Comentario agregado correctamente.', 'exito');
        formComentario.reset();
        await cargarDetalle();
      } catch (error) {
        await esperarMinimo(inicio, 450);
        mostrarMensaje('mensaje-comentario', 'No se pudo conectar con el servidor.', 'error');
      } finally {
        setBotonLoading(boton, false);
      }
    });
  }

  function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  }

  function esperarMinimo(inicio, minimo = 450) {
    const transcurrido = Date.now() - inicio;
    const restante = Math.max(0, minimo - transcurrido);
    return new Promise(resolve => setTimeout(resolve, restante));
  }

  function setBotonLoading(boton, loading, textoLoading = 'Procesando...') {
    if (!boton) return;

    if (loading) {
      if (!boton.dataset.originalText) {
        boton.dataset.originalText = boton.innerHTML;
      }

      boton.classList.add('is-loading');
      boton.disabled = true;
      boton.setAttribute('aria-busy', 'true');
      boton.innerHTML = `<span class="btn-text">${textoLoading}</span>`;
    } else {
      boton.classList.remove('is-loading');
      boton.disabled = false;
      boton.setAttribute('aria-busy', 'false');

      if (boton.dataset.originalText) {
        boton.innerHTML = boton.dataset.originalText;
      }
    }
  }

  function setContenedorBusy(contenedor, busy = true) {
    if (!contenedor) return;
    contenedor.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function mostrarMensaje(contenedorId, texto, tipo = 'info') {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    contenedor.className = `mensaje ${tipo}`;
    contenedor.textContent = texto;
    contenedor.style.display = 'block';
  }

  function limpiarMensaje(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    contenedor.textContent = '';
    contenedor.className = 'mensaje';
    contenedor.style.display = 'none';
  }

  function renderCargandoPost() {
    if (!contenedorPost) return;

    contenedorPost.innerHTML = `
      <div class="panel-header loading-fade">
        <h2>Cargando publicación...</h2>
        <p>Espera un momento mientras obtenemos el contenido.</p>
      </div>
    `;
  }

  function renderErrorPost(mensaje = 'Error al cargar la publicación.') {
    if (!contenedorPost) return;

    contenedorPost.innerHTML = `
      <div class="panel-header">
        <h2>No se pudo cargar la publicación</h2>
        <p>${escaparHTML(mensaje)}</p>
      </div>
    `;
  }

  function renderCargandoComentarios() {
    if (!listaComentarios) return;

    listaComentarios.innerHTML = `
      <div class="tarjeta-comentario skeleton-card loading-fade">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
      </div>
    `;
  }

  function renderVacioComentarios() {
    if (!listaComentarios) return;

    listaComentarios.innerHTML = `
      <div class="tarjeta-comentario">
        <div class="comentario-meta">
          <span class="comentario-autor">Aún no hay comentarios</span>
        </div>
        <p class="comentario-texto">Sé el primero en aportar a esta conversación.</p>
      </div>
    `;
  }

  function inicializarEventosReporte() {
    const btnReportar = document.getElementById('btn-reportar-publicacion');
    const boxReporte = document.getElementById('reporte-publicacion-box');
    const btnConfirmar = document.getElementById('btn-confirmar-reporte');
    const btnCancelar = document.getElementById('btn-cancelar-reporte');

    if (!btnReportar || !boxReporte || !btnConfirmar || !btnCancelar) return;

    btnReportar.addEventListener('click', () => {
      boxReporte.style.display = 'flex';
      limpiarMensaje('mensaje-reporte');
    });

    btnCancelar.addEventListener('click', () => {
      boxReporte.style.display = 'none';
      limpiarMensaje('mensaje-reporte');
    });

    btnConfirmar.addEventListener('click', async () => {
      limpiarMensaje('mensaje-reporte');

      const inicio = Date.now();
      setBotonLoading(btnConfirmar, true, 'Reportando...');
      btnCancelar.disabled = true;

      try {
        const respuesta = await fetch(`${API_URL}/forum/${idPublicacion}/reportar`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sesion.token}`
          }
        });

        const resultado = await respuesta.json();
        await esperarMinimo(inicio, 450);

        if (!respuesta.ok) {
          mostrarMensaje('mensaje-reporte', resultado.message || 'No se pudo reportar la publicación.', 'error');
          return;
        }

        mostrarMensaje('mensaje-reporte', 'Publicación reportada correctamente.', 'exito');
        btnConfirmar.disabled = true;
        btnReportar.disabled = true;
        btnCancelar.disabled = true;
        btnReportar.textContent = 'Publicación reportada';
      } catch (error) {
        await esperarMinimo(inicio, 450);
        mostrarMensaje('mensaje-reporte', 'No se pudo conectar con el servidor.', 'error');
      } finally {
        setBotonLoading(btnConfirmar, false);
        if (!btnReportar.disabled) {
          btnCancelar.disabled = false;
        }
      }
    });
  }

  async function cargarDetalle() {
    renderCargandoPost();
    renderCargandoComentarios();
    setContenedorBusy(contenedorPost, true);
    setContenedorBusy(listaComentarios, true);

    try {
      const respuesta = await fetch(`${API_URL}/forum/${idPublicacion}`);

      if (!respuesta.ok) {
        renderErrorPost('Publicación no encontrada.');
        listaComentarios.innerHTML = '';
        return;
      }

      const pub = await respuesta.json();

      contenedorPost.innerHTML = `
        <div class="panel-header">
          <h2 class="post-titulo">${escaparHTML(pub.titulo)}</h2>
          <p class="post-contenido">${escaparHTML(pub.contenido)}</p>
          <div class="post-meta">
            <span>Por ${escaparHTML(pub.autor)}</span>
          </div>
        </div>

        <div class="post-acciones">
          <button id="btn-reportar-publicacion" type="button" class="btn-secundario btn-reportar">
            <span class="btn-text">Reportar publicación</span>
          </button>
        </div>

        <div id="reporte-publicacion-box" class="reporte-box" style="display: none;">
          <p>¿Deseas reportar esta publicación por contenido inapropiado?</p>
          <div class="reporte-acciones">
            <button id="btn-confirmar-reporte" type="button" class="btn-principal">
              <span class="btn-text">Sí, reportar</span>
            </button>
            <button id="btn-cancelar-reporte" type="button" class="btn-secundario">
              Cancelar
            </button>
          </div>
          <p id="mensaje-reporte" class="mensaje" role="alert" style="display:none;"></p>
        </div>
      `;

      inicializarEventosReporte();

      if (!Array.isArray(pub.comentarios) || pub.comentarios.length === 0) {
        renderVacioComentarios();
        return;
      }

      listaComentarios.innerHTML = pub.comentarios.map(c => `
        <article class="tarjeta-comentario">
          <div class="comentario-meta">
            <span class="comentario-autor">${escaparHTML(c.autor)}</span>
          </div>
          <p class="comentario-texto">${escaparHTML(c.contenido)}</p>
        </article>
      `).join('');
    } catch (error) {
      renderErrorPost('No se pudo establecer conexión con el servidor.');
      listaComentarios.innerHTML = `
        <div class="tarjeta-comentario">
          <div class="comentario-meta">
            <span class="comentario-autor">Error</span>
          </div>
          <p class="comentario-texto">No se pudieron cargar los comentarios.</p>
        </div>
      `;
    } finally {
      setContenedorBusy(contenedorPost, false);
      setContenedorBusy(listaComentarios, false);
    }
  }
}