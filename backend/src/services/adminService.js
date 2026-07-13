
const UsuarioModel = require('../models/usuarioModel');
const PsicologoModel = require('../models/psicologoModel');
const PublicacionModel = require('../models/publicacionModel');

const estadosValidosUsuario = ['activo', 'inactivo', 'bloqueado'];
const accionesValidasPublicacion = ['aprobar', 'eliminar'];

async function listarUsuarios() {
  return UsuarioModel.listarTodos();
}

async function cambiarEstadoUsuario(idUsuario, nuevoEstado) {
  if (!estadosValidosUsuario.includes(nuevoEstado)) {
    const error = new Error('Estado inválido');
    error.tipo = 'VALIDACION';
    throw error;
  }

  await UsuarioModel.actualizarEstado(idUsuario, nuevoEstado);
  return { message: `Usuario actualizado a estado: ${nuevoEstado}` };
}

async function listarSolicitudesPsicologo() {
  return PsicologoModel.listarPendientes();
}

async function aprobarPsicologo(idSolicitud) {
  const solicitud = await PsicologoModel.buscarPorId(idSolicitud);

  if (!solicitud) {
    const error = new Error('Solicitud no encontrada');
    error.tipo = 'NO_ENCONTRADA';
    throw error;
  }

  if (Number(solicitud.verificado) === 1) {
    const error = new Error('La solicitud ya fue aprobada anteriormente');
    error.tipo = 'CONFLICTO';
    throw error;
  }

  await PsicologoModel.aprobarSolicitud(idSolicitud);
  await UsuarioModel.actualizarRol(solicitud.id_usuario, 2);

  return { message: 'Psicólogo verificado y aprobado exitosamente.' };
}

async function rechazarPsicologo(idSolicitud) {
  const solicitud = await PsicologoModel.buscarPorId(idSolicitud);

  if (!solicitud) {
    const error = new Error('Solicitud no encontrada');
    error.tipo = 'NO_ENCONTRADA';
    throw error;
  }

  if (Number(solicitud.verificado) === 1) {
    const error = new Error('No se puede rechazar una solicitud ya aprobada');
    error.tipo = 'VALIDACION';
    throw error;
  }

  await PsicologoModel.eliminarSolicitud(idSolicitud);

  return { message: 'Solicitud de psicólogo rechazada.' };
}

async function listarPublicacionesReportadas() {
  return PublicacionModel.listarReportadas();
}

async function moderarPublicacion(idPublicacion, accion) {
  if (!accionesValidasPublicacion.includes(accion)) {
    const error = new Error('Acción inválida');
    error.tipo = 'VALIDACION';
    throw error;
  }

  const nuevoEstado = accion === 'aprobar' ? 'visible' : 'eliminada';
  await PublicacionModel.actualizarEstado(idPublicacion, nuevoEstado);

  return { message: `Publicación actualizada a estado: ${nuevoEstado}` };
}

module.exports = {
  listarUsuarios,
  cambiarEstadoUsuario,
  listarSolicitudesPsicologo,
  aprobarPsicologo,
  rechazarPsicologo,
  listarPublicacionesReportadas,
  moderarPublicacion,
};