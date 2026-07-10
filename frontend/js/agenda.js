
const sesion = requerirSesion([1, 2]); // solo Paciente (1) o Psicólogo (2)

if (sesion) {
  renderNav();

  if (sesion.usuario.id_rol === 1) {
    inicializarVistaPaciente();
  }

  if (sesion.usuario.id_rol === 2) {
    inicializarVistaPsicologo();
  }
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function renderEstado(contenedor, mensaje, tipo = '') {
  if (!contenedor) return;
  contenedor.innerHTML = `<p class="${tipo}">${escaparHTML(mensaje)}</p>`;
}

function inicializarVistaPaciente() {
  const vistaPaciente = document.getElementById('vista-paciente');
  const btnBuscar = document.getElementById('btn-buscar-disponibilidad');
  const inputPsicologo = document.getElementById('id-psicologo');
  const contenedorBloques = document.getElementById('bloques-disponibles');
  const contenedorReservas = document.getElementById('mis-reservas');

  if (!vistaPaciente || !btnBuscar || !inputPsicologo || !contenedorBloques || !contenedorReservas) return;

  vistaPaciente.style.display = 'block';

  btnBuscar.addEventListener('click', async () => {
    const idPsicologo = inputPsicologo.value.trim();

    if (!idPsicologo) {
      renderEstado(contenedorBloques, 'Ingresa un ID de psicólogo válido.', 'error');
      return;
    }

    renderEstado(contenedorBloques, 'Buscando disponibilidad...');

    try {
      const respuesta = await fetch(`${API_URL}/agenda/disponibilidad/${idPsicologo}`);
      const bloques = await respuesta.json();

      if (!respuesta.ok) {
        renderEstado(contenedorBloques, bloques.message || 'No se pudo obtener la disponibilidad.', 'error');
        return;
      }

      if (!Array.isArray(bloques) || bloques.length === 0) {
        renderEstado(contenedorBloques, 'Este psicólogo no tiene horas disponibles.');
        return;
      }

      contenedorBloques.innerHTML = bloques.map(b => `
        <div class="bloque-disponible">
          <span>${escaparHTML(b.fecha)} | ${escaparHTML(b.hora_inicio)} - ${escaparHTML(b.hora_fin)} | ${escaparHTML(b.modalidad_atencion)}</span>
          <button class="btn-reservar" data-id="${b.id_disponibilidad}">Reservar</button>
        </div>
      `).join('');
    } catch (error) {
      renderEstado(contenedorBloques, 'Error al buscar disponibilidad.', 'error');
    }
  });

  contenedorBloques.addEventListener('click', async (e) => {
    const boton = e.target.closest('.btn-reservar');
    if (!boton) return;

    const idDisponibilidad = Number(boton.dataset.id);

    if (!idDisponibilidad) {
      renderEstado(contenedorBloques, 'No se pudo identificar el bloque a reservar.', 'error');
      return;
    }

    boton.disabled = true;
    boton.textContent = 'Reservando...';

    try {
      const respuesta = await fetch(`${API_URL}/agenda/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sesion.token}`
        },
        body: JSON.stringify({ id_disponibilidad: idDisponibilidad })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        renderEstado(contenedorBloques, resultado.message || 'No se pudo reservar la hora.', 'error');
        return;
      }

      renderEstado(contenedorBloques, 'Reserva confirmada exitosamente.', 'exito');
      btnBuscar.click();
      cargarMisReservas(contenedorReservas);
    } catch (error) {
      renderEstado(contenedorBloques, 'No se pudo conectar con el servidor.', 'error');
    }
  });

  cargarMisReservas(contenedorReservas);
}

async function cargarMisReservas(contenedor) {
  if (!contenedor) return;

  renderEstado(contenedor, 'Cargando tus reservas...');

  try {
    const respuesta = await fetch(`${API_URL}/agenda/reservas/mis-reservas`, {
      headers: {
        'Authorization': `Bearer ${sesion.token}`
      }
    });

    const reservas = await respuesta.json();

    if (!respuesta.ok) {
      renderEstado(contenedor, reservas.message || 'Error al cargar tus reservas.', 'error');
      return;
    }

    if (!Array.isArray(reservas) || reservas.length === 0) {
      renderEstado(contenedor, 'Aún no tienes reservas.');
      return;
    }

    contenedor.innerHTML = reservas.map(r => `
      <div class="tarjeta-reserva">
        <span>${escaparHTML(r.fecha)} | ${escaparHTML(r.hora_inicio)} - ${escaparHTML(r.hora_fin)}</span>
        <span>Con ${escaparHTML(r.psicologo)}</span>
        <span class="estado-${escaparHTML(r.estado_reserva)}">${escaparHTML(r.estado_reserva)}</span>
      </div>
    `).join('');
  } catch (error) {
    renderEstado(contenedor, 'Error al cargar tus reservas.', 'error');
  }
}

function inicializarVistaPsicologo() {
  const vistaPsicologo = document.getElementById('vista-psicologo');
  const form = document.getElementById('form-disponibilidad');
  const mensajeId = 'mensaje-disponibilidad';
  const contenedorAgenda = document.getElementById('mi-agenda');

  if (!vistaPsicologo || !form || !contenedorAgenda) return;

  vistaPsicologo.style.display = 'block';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMensaje(mensajeId);

    const datos = {
      fecha: document.getElementById('fecha').value,
      hora_inicio: document.getElementById('hora-inicio').value,
      hora_fin: document.getElementById('hora-fin').value,
      modalidad_atencion: document.getElementById('modalidad').value
    };

    if (!datos.fecha || !datos.hora_inicio || !datos.hora_fin) {
      mostrarMensaje(mensajeId, 'Debes completar fecha, hora de inicio y hora de fin.', 'error');
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/agenda/disponibilidad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sesion.token}`
        },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        mostrarMensaje(mensajeId, resultado.message || 'No se pudo registrar el bloque.', 'error');
        return;
      }

      mostrarMensaje(mensajeId, 'Bloque de disponibilidad registrado.', 'exito');
      form.reset();
      cargarMiAgenda(contenedorAgenda);
    } catch (error) {
      mostrarMensaje(mensajeId, 'No se pudo conectar con el servidor.', 'error');
    }
  });

  contenedorAgenda.addEventListener('click', async (e) => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;

    const idReserva = Number(boton.dataset.id);
    const nuevoEstado = boton.dataset.accion;

    if (!idReserva || !nuevoEstado) {
      mostrarMensaje(mensajeId, 'No se pudo identificar la acción sobre la reserva.', 'error');
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/agenda/reservas/${idReserva}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sesion.token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        mostrarMensaje(mensajeId, resultado.message || 'No se pudo actualizar la reserva.', 'error');
        return;
      }

      mostrarMensaje(mensajeId, 'Reserva actualizada correctamente.', 'exito');
      cargarMiAgenda(contenedorAgenda);
    } catch (error) {
      mostrarMensaje(mensajeId, 'No se pudo conectar con el servidor.', 'error');
    }
  });

  cargarMiAgenda(contenedorAgenda);
}

async function cargarMiAgenda(contenedor) {
  if (!contenedor) return;

  renderEstado(contenedor, 'Cargando agenda...');

  try {
    const respuesta = await fetch(`${API_URL}/agenda/reservas/mi-agenda`, {
      headers: {
        'Authorization': `Bearer ${sesion.token}`
      }
    });

    const reservas = await respuesta.json();

    if (!respuesta.ok) {
      renderEstado(contenedor, reservas.message || 'No se pudo cargar tu agenda.', 'error');
      return;
    }

    if (!Array.isArray(reservas) || reservas.length === 0) {
      renderEstado(contenedor, 'Aún no tienes citas agendadas.');
      return;
    }

    contenedor.innerHTML = reservas.map(r => `
      <div class="tarjeta-reserva">
        <span>${escaparHTML(r.fecha)} | ${escaparHTML(r.hora_inicio)} - ${escaparHTML(r.hora_fin)}</span>
        <span>Paciente: ${escaparHTML(r.paciente)}</span>
        <span class="estado-${escaparHTML(r.estado_reserva)}">${escaparHTML(r.estado_reserva)}</span>
        ${r.estado_reserva === 'pendiente' ? `
          <button data-id="${r.id_reserva}" data-accion="confirmada">Confirmar</button>
          <button data-id="${r.id_reserva}" data-accion="cancelada">Cancelar</button>
        ` : ''}
      </div>
    `).join('');
  } catch (error) {
    renderEstado(contenedor, 'Error al cargar tu agenda.', 'error');
  }
}