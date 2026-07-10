
const sesion = requerirSesion([3]);

if (sesion) {
  renderNav();

  const tabs = document.querySelectorAll('.tab-btn');
  const tabSections = document.querySelectorAll('.tab-content');

  const listaUsuarios = document.getElementById('lista-usuarios');
  const listaSolicitudes = document.getElementById('lista-solicitudes');
  const listaReportadas = document.getElementById('lista-reportadas');

  const mensajeUsuarios = document.getElementById('mensaje-usuarios');
  const mensajeSolicitudes = document.getElementById('mensaje-solicitudes');
  const mensajeReportadas = document.getElementById('mensaje-reportadas');

  let tabActiva = 'usuarios';

  inicializarTabs();
  activarTab(tabActiva);
  cargarUsuarios();

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

  function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  }

  function mostrarMensaje(elemento, texto, tipo = 'info') {
    if (!elemento) return;
    elemento.className = `mensaje ${tipo}`;
    elemento.textContent = texto;
    elemento.style.display = 'block';
  }

  function limpiarMensaje(elemento) {
    if (!elemento) return;
    elemento.className = 'mensaje';
    elemento.textContent = '';
    elemento.style.display = 'none';
  }

  function inicializarTabs() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const nuevaTab = tab.dataset.tab;
        if (!nuevaTab || nuevaTab === tabActiva) return;

        tabActiva = nuevaTab;
        activarTab(tabActiva);

        if (tabActiva === 'usuarios') {
          cargarUsuarios();
        } else if (tabActiva === 'solicitudes') {
          cargarSolicitudes();
        } else if (tabActiva === 'reportadas') {
          cargarReportadas();
        }
      });
    });
  }

  function activarTab(tabId) {
    tabs.forEach(tab => {
      tab.classList.toggle('activo', tab.dataset.tab === tabId);
    });

    tabSections.forEach(section => {
      section.style.display = section.id === `tab-${tabId}` ? 'block' : 'none';
    });
  }

  function obtenerClaseEstadoUsuario(estado) {
    switch ((estado || '').toLowerCase()) {
      case 'activo':
        return 'estado-activo';
      case 'bloqueado':
        return 'estado-bloqueado';
      default:
        return 'estado-inactivo';
    }
  }

  function renderSkeletonLista(lista, cantidad = 2) {
    if (!lista) return;

    lista.innerHTML = Array.from({ length: cantidad }).map(() => `
      <article class="tarjeta-admin skeleton-card loading-fade">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
      </article>
    `).join('');
  }

  function renderEstadoVacio(lista, texto) {
    if (!lista) return;

    lista.innerHTML = `
      <div class="estado estado-vacio">
        <strong>Sin resultados</strong>
        <p>${escaparHTML(texto)}</p>
      </div>
    `;
  }

  async function cargarUsuarios() {
  limpiarMensaje(mensajeUsuarios);
  renderSkeletonLista(listaUsuarios);
  setContenedorBusy(listaUsuarios, true);

  try {
    const respuesta = await fetch(`${API_URL}/admin/usuarios`, {
      headers: {
        'Authorization': `Bearer ${sesion.token}`
      }
    });

    const usuarios = await respuesta.json();

    if (!respuesta.ok) {
      renderEstadoVacio(listaUsuarios, usuarios.message || 'No se pudo cargar la lista de usuarios.');
      return;
    }

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      renderEstadoVacio(listaUsuarios, 'No hay usuarios disponibles para administrar.');
      return;
    }

    listaUsuarios.innerHTML = usuarios.map(usuario => `
      <article class="tarjeta-admin" data-usuario-id="${usuario.id_usuario}">
        <div class="tarjeta-admin-top">
          <div>
            <strong>${escaparHTML(usuario.nombre || 'Usuario sin nombre')}</strong>
            <span class="sub">${escaparHTML(usuario.correo || 'Sin correo')}</span>
            <span class="sub">Rol: ${escaparHTML(usuario.nombre_rol || 'Sin rol')}</span>
            <span class="sub">Registro: ${escaparHTML((usuario.fecha_registro || '').slice(0, 10) || 'Sin fecha')}</span>
          </div>

          <span class="badge-estado ${obtenerClaseEstadoUsuario(usuario.estado)}">
            ${escaparHTML(usuario.estado || 'inactivo')}
          </span>
        </div>

        <div class="acciones-admin">
          <select data-select-estado>
            <option value="activo" ${usuario.estado === 'activo' ? 'selected' : ''}>Activo</option>
            <option value="inactivo" ${usuario.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
            <option value="bloqueado" ${usuario.estado === 'bloqueado' ? 'selected' : ''}>Bloqueado</option>
          </select>

          <button type="button" class="btn-principal" data-btn-guardar-estado>
            <span class="btn-text">Guardar estado</span>
          </button>
        </div>
      </article>
    `).join('');

    bindEventosUsuarios();
  } catch (error) {
    renderEstadoVacio(listaUsuarios, 'No se pudo conectar con el servidor.');
  } finally {
    setContenedorBusy(listaUsuarios, false);
  }
}
  function bindEventosUsuarios() {
    const tarjetas = listaUsuarios.querySelectorAll('[data-usuario-id]');

    tarjetas.forEach(tarjeta => {
      const boton = tarjeta.querySelector('[data-btn-guardar-estado]');
      const select = tarjeta.querySelector('[data-select-estado]');
      const userId = tarjeta.dataset.usuarioId;

      if (!boton || !select || !userId) return;

      boton.addEventListener('click', async () => {
        limpiarMensaje(mensajeUsuarios);

        const inicio = Date.now();
        setBotonLoading(boton, true, 'Guardando...');
        setContenedorBusy(tarjeta, true);
        select.disabled = true;

        try {
          const respuesta = await fetch(`${API_URL}/admin/usuarios/${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sesion.token}`
            },
            body: JSON.stringify({ estado: select.value })
          });

          const resultado = await respuesta.json();
          await esperarMinimo(inicio, 450);

          if (!respuesta.ok) {
            mostrarMensaje(mensajeUsuarios, resultado.message || 'No se pudo actualizar el estado del usuario.', 'error');
            return;
          }

          mostrarMensaje(mensajeUsuarios, 'Estado de usuario actualizado correctamente.', 'exito');
          await cargarUsuarios();
        } catch (error) {
          await esperarMinimo(inicio, 450);
          mostrarMensaje(mensajeUsuarios, 'No se pudo conectar con el servidor.', 'error');
        } finally {
          setBotonLoading(boton, false);
          setContenedorBusy(tarjeta, false);
          select.disabled = false;
        }
      });
    });
  }

  async function cargarSolicitudes() {
  limpiarMensaje(mensajeSolicitudes);
  renderSkeletonLista(listaSolicitudes);
  setContenedorBusy(listaSolicitudes, true);

  try {
    const respuesta = await fetch(`${API_URL}/admin/psicologos/pendientes`, {
      headers: {
        'Authorization': `Bearer ${sesion.token}`
      }
    });

    const solicitudes = await respuesta.json();

    if (!respuesta.ok) {
      renderEstadoVacio(listaSolicitudes, solicitudes.message || 'No se pudo cargar la lista de solicitudes.');
      return;
    }

    if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
      renderEstadoVacio(listaSolicitudes, 'No hay solicitudes pendientes por revisar.');
      return;
    }

    listaSolicitudes.innerHTML = solicitudes.map(item => `
      <article class="tarjeta-admin" data-solicitud-id="${item.id_psicologo}">
        <div class="tarjeta-admin-top">
          <div>
            <strong>${escaparHTML(item.nombre || 'Postulante')}</strong>
            <span class="sub">${escaparHTML(item.correo || 'Sin correo')}</span>
            <span class="sub">Especialidad: ${escaparHTML(item.especialidad || 'No informada')}</span>
          </div>

          <span class="badge-estado estado-pendiente">Pendiente</span>
        </div>

        <div class="tarjeta-admin-body">
          <p>Años de experiencia: ${escaparHTML(String(item.anios_experiencia ?? 'No informado'))}</p>
          <p>Modalidad de atención: ${escaparHTML(item.modalidad_atencion || 'No informada')}</p>
          <p>Teléfono: ${escaparHTML(item.telefono_contacto || 'No informado')}</p>
          <p>Número de colegiado: ${escaparHTML(item.numero_colegiado || 'No informado')}</p>
          <p>Universidad: ${escaparHTML(item.universidad_titulacion || 'No informada')}</p>
          <p>Año de titulación: ${escaparHTML(String(item.anio_titulacion ?? 'No informado'))}</p>
          <p>Documento: ${escaparHTML(item.documento_credencial || 'No informado')}</p>
        </div>

        <div class="acciones-admin">
          <button type="button" class="btn-aprobar" data-btn-aprobar>
            <span class="btn-text">Aprobar</span>
          </button>

          <button type="button" class="btn-rechazar" data-btn-rechazar>
            <span class="btn-text">Rechazar</span>
          </button>
        </div>
      </article>
    `).join('');

    bindEventosSolicitudes();
  } catch (error) {
    renderEstadoVacio(listaSolicitudes, 'No se pudo conectar con el servidor.');
  } finally {
    setContenedorBusy(listaSolicitudes, false);
  }
}

  function bindEventosSolicitudes() {
    const tarjetas = listaSolicitudes.querySelectorAll('[data-solicitud-id]');

    tarjetas.forEach(tarjeta => {
      const btnAprobar = tarjeta.querySelector('[data-btn-aprobar]');
      const btnRechazar = tarjeta.querySelector('[data-btn-rechazar]');
      const solicitudId = tarjeta.dataset.solicitudId;

      if (btnAprobar) {
        btnAprobar.addEventListener('click', () => procesarSolicitud(solicitudId, 'aprobar', btnAprobar, btnRechazar, tarjeta));
      }

      if (btnRechazar) {
        btnRechazar.addEventListener('click', () => procesarSolicitud(solicitudId, 'rechazar', btnRechazar, btnAprobar, tarjeta));
      }
    });
  }

  async function procesarSolicitud(id, accion, botonActual, botonSecundario, tarjeta) {
    limpiarMensaje(mensajeSolicitudes);

    const inicio = Date.now();
    setBotonLoading(botonActual, true, accion === 'aprobar' ? 'Aprobando...' : 'Rechazando...');
    setContenedorBusy(tarjeta, true);

    if (botonSecundario) botonSecundario.disabled = true;

    try {
      const endpoint = accion === 'aprobar'
        ? `${API_URL}/admin/psicologos/${id}/aprobar`
        : `${API_URL}/admin/psicologos/${id}/rechazar`;

      const respuesta = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sesion.token}`
        }
      });

      const resultado = await respuesta.json();
      await esperarMinimo(inicio, 450);

      if (!respuesta.ok) {
        mostrarMensaje(mensajeSolicitudes, resultado.message || 'No se pudo procesar la solicitud.', 'error');
        return;
      }

      mostrarMensaje(
        mensajeSolicitudes,
        accion === 'aprobar' ? 'Solicitud aprobada correctamente.' : 'Solicitud rechazada correctamente.',
        'exito'
      );

      await cargarSolicitudes();
    } catch (error) {
      await esperarMinimo(inicio, 450);
      mostrarMensaje(mensajeSolicitudes, 'No se pudo conectar con el servidor.', 'error');
    } finally {
      setBotonLoading(botonActual, false);
      setContenedorBusy(tarjeta, false);
      if (botonSecundario) botonSecundario.disabled = false;
    }
  }

 async function cargarReportadas() {
  limpiarMensaje(mensajeReportadas);
  renderSkeletonLista(listaReportadas);
  setContenedorBusy(listaReportadas, true);

  try {
    const respuesta = await fetch(`${API_URL}/admin/publicaciones/reportadas`, {
      headers: {
        'Authorization': `Bearer ${sesion.token}`
      }
    });

    const publicaciones = await respuesta.json();

    if (!respuesta.ok) {
      renderEstadoVacio(listaReportadas, publicaciones.message || 'No se pudo cargar la lista de publicaciones reportadas.');
      return;
    }

    if (!Array.isArray(publicaciones) || publicaciones.length === 0) {
      renderEstadoVacio(listaReportadas, 'No hay publicaciones reportadas pendientes de moderación.');
      return;
    }

    listaReportadas.innerHTML = publicaciones.map(pub => `
      <article class="tarjeta-admin tarjeta-admin-reportada" data-publicacion-id="${pub.id_publicacion}">
        <div class="tarjeta-admin-top">
          <div>
            <strong>${escaparHTML(pub.titulo || 'Sin título')}</strong>
            <span class="sub">Autor: ${escaparHTML(pub.autor || 'Desconocido')}</span>
            <span class="sub">Fecha: ${escaparHTML((pub.fecha_creacion || '').slice(0, 10) || 'Sin fecha')}</span>
          </div>

          <span class="badge-estado estado-reportada">Reportada</span>
        </div>

        <div class="tarjeta-admin-body">
          <p>${escaparHTML(pub.contenido || '')}</p>
        </div>

        <div class="acciones-admin">
          <button type="button" class="btn-aprobar" data-btn-mantener>
            <span class="btn-text">Mantener publicación</span>
          </button>

          <button type="button" class="btn-rechazar" data-btn-eliminar>
            <span class="btn-text">Eliminar publicación</span>
          </button>
        </div>
      </article>
    `).join('');

    bindEventosReportadas();
  } catch (error) {
    renderEstadoVacio(listaReportadas, 'No se pudo conectar con el servidor.');
  } finally {
    setContenedorBusy(listaReportadas, false);
  }
}

 function bindEventosReportadas() {
  const tarjetas = listaReportadas.querySelectorAll('[data-publicacion-id]');

  tarjetas.forEach(tarjeta => {
    const btnMantener = tarjeta.querySelector('[data-btn-mantener]');
    const btnEliminar = tarjeta.querySelector('[data-btn-eliminar]');
    const publicacionId = tarjeta.dataset.publicacionId;

    if (btnMantener) {
      btnMantener.addEventListener('click', () => moderarPublicacion(publicacionId, 'aprobar', btnMantener, btnEliminar, tarjeta));
    }

    if (btnEliminar) {
      btnEliminar.addEventListener('click', () => moderarPublicacion(publicacionId, 'eliminar', btnEliminar, btnMantener, tarjeta));
    }
  });
}

  async function moderarPublicacion(id, accion, botonActual, botonSecundario, tarjeta) {
    limpiarMensaje(mensajeReportadas);

    const inicio = Date.now();
    setBotonLoading(botonActual, true, accion === 'eliminar' ? 'Eliminando...' : 'Guardando...');
    setContenedorBusy(tarjeta, true);

    if (botonSecundario) botonSecundario.disabled = true;

    try {
      const respuesta = await fetch(`${API_URL}/admin/publicaciones/${id}/moderar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sesion.token}`
        },
        body: JSON.stringify({ accion })
      });

      const resultado = await respuesta.json();
      await esperarMinimo(inicio, 450);

      if (!respuesta.ok) {
        mostrarMensaje(mensajeReportadas, resultado.message || 'No se pudo moderar la publicación.', 'error');
        return;
      }

      mostrarMensaje(
        mensajeReportadas,
        accion === 'eliminar'
          ? 'La publicación fue eliminada correctamente.'
          : 'La publicación fue mantenida correctamente.',
        'exito'
      );

      await cargarReportadas();
    } catch (error) {
      await esperarMinimo(inicio, 450);
      mostrarMensaje(mensajeReportadas, 'No se pudo conectar con el servidor.', 'error');
    } finally {
      setBotonLoading(botonActual, false);
      setContenedorBusy(tarjeta, false);
      if (botonSecundario) botonSecundario.disabled = false;
    }
  }
}