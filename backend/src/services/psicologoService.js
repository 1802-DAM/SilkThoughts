// src/services/psicologoService.js
const PsicologoModel = require('../models/psicologoModel');

function validarDatosPostulacion(datos) {
  const {
    especialidad,
    anios_experiencia,
    modalidad_atencion,
    telefono_contacto,
    numero_colegiado,
    universidad_titulacion,
    anio_titulacion,
    documento_credencial,
  } = datos;

  if (
    !especialidad ||
    !anios_experiencia ||
    !modalidad_atencion ||
    !telefono_contacto ||
    !numero_colegiado ||
    !universidad_titulacion ||
    !anio_titulacion ||
    !documento_credencial
  ) {
    const error = new Error('Todos los campos son obligatorios.');
    error.tipo = 'VALIDACION';
    throw error;
  }

  const aniosExp = Number(anios_experiencia);
  const anioTit = Number(anio_titulacion);

  if (Number.isNaN(aniosExp) || aniosExp < 0) {
    const error = new Error('Los años de experiencia deben ser un número válido.');
    error.tipo = 'VALIDACION';
    throw error;
  }

  const anioActual = new Date().getFullYear();
  if (Number.isNaN(anioTit) || anioTit < 1900 || anioTit > anioActual) {
    const error = new Error('El año de titulación no es válido.');
    error.tipo = 'VALIDACION';
    throw error;
  }

  return { aniosExp, anioTit };
}

async function crearSolicitudPostulacion(datos, usuario) {
  const { id_usuario, id_rol } = usuario;

  if (id_rol !== 1) {
    const error = new Error('Solo un usuario paciente puede postular a psicólogo.');
    error.tipo = 'PERMISO';
    throw error;
  }

  const { aniosExp, anioTit } = validarDatosPostulacion(datos);

  const solicitudExistente = await PsicologoModel.buscarPorUsuario(id_usuario);

  if (solicitudExistente) {
    const verificado = Number(solicitudExistente.verificado);

    if (verificado === 0) {
      const error = new Error('Ya tienes una solicitud pendiente de revisión.');
      error.tipo = 'CONFLICTO';
      throw error;
    }

    if (verificado === 1) {
      const error = new Error('Ya eres un psicólogo verificado.');
      error.tipo = 'CONFLICTO';
      throw error;
    }
  }

  const id_psicologo = await PsicologoModel.crearSolicitud({
    id_usuario,
    especialidad: datos.especialidad.trim(),
    anios_experiencia: aniosExp,
    modalidad_atencion: datos.modalidad_atencion.trim(),
    telefono_contacto: datos.telefono_contacto.trim(),
    numero_colegiado: datos.numero_colegiado.trim(),
    universidad_titulacion: datos.universidad_titulacion.trim(),
    anio_titulacion: anioTit,
    documento_credencial: datos.documento_credencial.trim(),
  });

  return {
    message: 'Solicitud enviada correctamente. Quedó pendiente de revisión.',
    id_psicologo,
  };
}

async function obtenerMiSolicitud(id_usuario) {
  const solicitud = await PsicologoModel.buscarPorUsuario(id_usuario);

  if (!solicitud) {
    const error = new Error('No tienes una solicitud registrada.');
    error.tipo = 'NO_ENCONTRADA';
    throw error;
  }

  return {
    id_psicologo: solicitud.id_psicologo,
    especialidad: solicitud.especialidad,
    anios_experiencia: solicitud.anios_experiencia,
    modalidad_atencion: solicitud.modalidad_atencion,
    telefono_contacto: solicitud.telefono_contacto,
    numero_colegiado: solicitud.numero_colegiado,
    universidad_titulacion: solicitud.universidad_titulacion,
    anio_titulacion: solicitud.anio_titulacion,
    documento_credencial: solicitud.documento_credencial,
    verificado: solicitud.verificado,
    fecha_verificacion: solicitud.fecha_verificacion,
  };
}

module.exports = {
  crearSolicitudPostulacion,
  obtenerMiSolicitud,
};