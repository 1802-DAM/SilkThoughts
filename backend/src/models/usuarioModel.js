const db = require('../config/db');

const UsuarioModel = {
  async crear({ nombre, correo, contrasena_hash, id_rol }) {
    const [result] = await db.query(
      `INSERT INTO USUARIO (nombre, correo, contrasena_hash, id_rol) VALUES (?, ?, ?, ?)`,
      [nombre, correo, contrasena_hash, id_rol]
    );
    return result.insertId;
  },

  async buscarPorCorreo(correo) {
    const [rows] = await db.query(
      `SELECT * FROM USUARIO WHERE correo = ?`,
      [correo]
    );
    return rows[0];
  },

  async buscarPorId(id_usuario) {
    const [rows] = await db.query(
      `SELECT id_usuario, nombre, correo, estado, id_rol
       FROM USUARIO
       WHERE id_usuario = ?`,
      [id_usuario]
    );
    return rows[0];
  },

  async listarTodos() {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.estado, u.fecha_registro, r.nombre_rol
       FROM USUARIO u
       JOIN ROL r ON u.id_rol = r.id_rol
       ORDER BY u.fecha_registro DESC`
    );
    return rows;
  },

  async actualizarEstado(id_usuario, estado) {
    await db.query(
      `UPDATE USUARIO
       SET estado = ?
       WHERE id_usuario = ?`,
      [estado, id_usuario]
    );
  },

  async actualizarRol(id_usuario, id_rol) {
    await db.query(
      `UPDATE USUARIO
       SET id_rol = ?
       WHERE id_usuario = ?`,
      [id_rol, id_usuario]
    );
  }
};

module.exports = UsuarioModel;