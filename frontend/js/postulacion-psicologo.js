
const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');

if (!token || !usuarioGuardado) {
  window.location.href = 'login.html';
} else {
  const usuario = JSON.parse(usuarioGuardado);
  const sesion = { token, usuario };

  if (typeof renderNav === 'function') {
    renderNav();
  }

  const estadoSolicitud = document.getElementById('estado-solicitud');
  const seccionFormulario = document.getElementById('seccion-formulario');
  const form = document.getElementById('form-postulacion-psicologo');
  const btnEnviar = document.getElementById('btn-enviar-postulacion');

  function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
  }

  function renderEstadoCargando() {
    estadoSolicitud.innerHTML = `
      <div class="estado estado-cargando">
        <p>Consultando estado de tu solicitud...</p>
      </div>
    `;
  }

  function renderEstadoSinSolicitud() {
    estadoSolicitud.innerHTML = `
      <div class="estado estado-vacio">
        <h3>Aún no has enviado una solicitud</h3>
        <p>Completa el formulario para postular a la verificación como psicólogo.</p>
      </div>
    `;
    seccionFormulario.style.display = 'block';
  }

  function renderEstadoPendiente(data) {
    estadoSolicitud.innerHTML = `
      <div class="estado estado-vacio">
        <h3>Tu solicitud está en revisión</h3>
        <p>Ya recibimos tu postulación en el área de <strong>${escaparHTML(data.especialidad)}</strong>.</p>
        <p>Un administrador revisará tus antecedentes antes de aprobar tu perfil.</p>
      </div>
    `;
    seccionFormulario.style.display = 'none';
  }

  function renderEstadoAprobado(data) {
    estadoSolicitud.innerHTML = `
      <div class="estado estado-exito">
        <h3>Tu perfil fue aprobado</h3>
        <p>Ya cuentas con verificación como psicólogo en SilkThoughts.</p>
        <p><strong>Especialidad:</strong> ${escaparHTML(data.especialidad)}</p>
      </div>
    `;
    seccionFormulario.style.display = 'none';
  }

  function renderEstadoError(texto = 'No se pudo consultar el estado de tu solicitud.') {
    estadoSolicitud.innerHTML = `
      <div class="estado estado-error">
        <h3>Error al cargar la información</h3>
        <p>${escaparHTML(texto)}</p>
      </div>
    `;
    seccionFormulario.style.display = 'none';
  }

  function mostrarMensajeLocal(elementId, texto, tipo = 'info') {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.textContent = texto;
    el.className = `mensaje ${tipo}`;
    el.style.display = 'block';
  }

  function limpiarMensajeLocal(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.textContent = '';
    el.className = 'mensaje';
    el.style.display = 'none';
  }

  async function cargarEstadoSolicitud() {
    renderEstadoCargando();
    seccionFormulario.style.display = 'none';

    try {
      const respuesta = await fetch(`${API_URL}/psicologos/mi-solicitud`, {
        headers: {
        'Authorization': `Bearer ${sesion.token}`,
        },
      });

      if (respuesta.status === 404) {
        renderEstadoSinSolicitud();
        return;
      }

      const data = await respuesta.json();

      if (!respuesta.ok) {
        renderEstadoError(data.message || 'No fue posible obtener tu solicitud.');
        return;
      }

      if (Number(data.verificado) === 1) {
        renderEstadoAprobado(data);
        return;
      }

      renderEstadoPendiente(data);
    } catch (error) {
      renderEstadoError('No se pudo conectar con el servidor.');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMensajeLocal('mensaje-postulacion');

    const payload = {
      especialidad: document.getElementById('especialidad').value.trim(),
      anios_experiencia: document.getElementById('anios_experiencia').value.trim(),
      modalidad_atencion: document.getElementById('modalidad_atencion').value,
      telefono_contacto: document.getElementById('telefono_contacto').value.trim(),
      numero_colegiado: document.getElementById('numero_colegiado').value.trim(),
      universidad_titulacion: document.getElementById('universidad_titulacion').value.trim(),
      anio_titulacion: document.getElementById('anio_titulacion').value.trim(),
      documento_credencial: document.getElementById('documento_credencial').value.trim()
    };

    if (
      !payload.especialidad ||
      !payload.anios_experiencia ||
      !payload.modalidad_atencion ||
      !payload.telefono_contacto ||
      !payload.numero_colegiado ||
      !payload.universidad_titulacion ||
      !payload.anio_titulacion ||
      !payload.documento_credencial
    ) {
      mostrarMensajeLocal('mensaje-postulacion', 'Completa todos los campos obligatorios.', 'error');
      return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando solicitud...';

    try {
        const respuesta = await fetch(`${API_URL}/psicologos/postular`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sesion.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        mostrarMensajeLocal('mensaje-postulacion', data.message || 'No se pudo enviar la solicitud.', 'error');
        return;
      }

      mostrarMensajeLocal('mensaje-postulacion', data.message || 'Solicitud enviada correctamente.', 'exito');
      form.reset();
      await cargarEstadoSolicitud();
    } catch (error) {
      mostrarMensajeLocal('mensaje-postulacion', 'No se pudo conectar con el servidor.', 'error');
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Enviar solicitud';
    }
  });

  cargarEstadoSolicitud();
}