
const db = require('../config/db');

const ReservaModel = {
  async crear({ id_disponibilidad, id_usuario_paciente }) {
    const [result] = await db.query(
      `INSERT INTO RESERVA (id_disponibilidad, id_usuario_paciente) VALUES (?, ?)`,
      [id_disponibilidad, id_usuario_paciente]
    );
    return result.insertId;
  },

  async listarPorPaciente(id_usuario_paciente) {
    const [rows] = await db.query(
      `SELECT r.id_reserva, r.fecha_reserva, r.estado_reserva,
              d.fecha, d.hora_inicio, d.hora_fin, d.modalidad_atencion,
              u.nombre AS psicologo
       FROM RESERVA r
       JOIN DISPONIBILIDAD d ON r.id_disponibilidad = d.id_disponibilidad
       JOIN PSICOLOGO p ON d.id_psicologo = p.id_psicologo
       JOIN USUARIO u ON p.id_usuario = u.id_usuario
       WHERE r.id_usuario_paciente = ?
       ORDER BY d.fecha DESC`,
      [id_usuario_paciente]
    );
    return rows;
  },

  async listarPorPsicologo(id_psicologo) {
    const [rows] = await db.query(
      `SELECT r.id_reserva, r.estado_reserva,
              d.fecha, d.hora_inicio, d.hora_fin,
              u.nombre AS paciente
       FROM RESERVA r
       JOIN DISPONIBILIDAD d ON r.id_disponibilidad = d.id_disponibilidad
       JOIN USUARIO u ON r.id_usuario_paciente = u.id_usuario
       WHERE d.id_psicologo = ?
       ORDER BY d.fecha ASC`,
      [id_psicologo]
    );
    return rows;
  },

  async actualizarEstado(id_reserva, nuevo_estado) {
    await db.query(
      `UPDATE RESERVA SET estado_reserva = ? WHERE id_reserva = ?`,
      [nuevo_estado, id_reserva]
    );
  }
};

module.exports = ReservaModel;