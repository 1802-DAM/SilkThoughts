
const db = require('../config/db');

const PublicacionModel = {
  async crear({ id_usuario_autor, titulo, contenido }) {
    const [result] = await db.query(
      `INSERT INTO PUBLICACION (id_usuario_autor, titulo, contenido) VALUES (?, ?, ?)`,
      [id_usuario_autor, titulo, contenido]
    );
    return result.insertId;
  },

  async listarTodas() {
    const [rows] = await db.query(
      `SELECT p.id_publicacion, p.titulo, p.contenido, p.fecha_creacion, 
              u.nombre AS autor,
              (SELECT COUNT(*) FROM COMENTARIO c WHERE c.id_publicacion = p.id_publicacion) AS total_comentarios
       FROM PUBLICACION p
       JOIN USUARIO u ON p.id_usuario_autor = u.id_usuario
       WHERE p.estado_publicacion = 'visible'
       ORDER BY p.fecha_creacion DESC`
    );

    return rows;
  },

  async buscarPorId(id_publicacion) {
    const [rows] = await db.query(
      `SELECT p.id_publicacion, p.titulo, p.contenido, p.fecha_creacion, 
              p.estado_publicacion,
              u.nombre AS autor
       FROM PUBLICACION p
       JOIN USUARIO u ON p.id_usuario_autor = u.id_usuario
       WHERE p.id_publicacion = ?`,
      [id_publicacion]
    );

    return rows[0];
  },

  async listarReportadas() {
    const [rows] = await db.query(
      `SELECT p.id_publicacion, p.titulo, p.contenido, p.fecha_creacion, u.nombre AS autor
       FROM PUBLICACION p
       JOIN USUARIO u ON p.id_usuario_autor = u.id_usuario
       WHERE p.estado_publicacion = 'reportada'
       ORDER BY p.fecha_creacion DESC`
    );
    return rows;
  },

  async actualizarEstado(id_publicacion, estado) {
    await db.query(
      `UPDATE PUBLICACION
       SET estado_publicacion = ?
       WHERE id_publicacion = ?`,
      [estado, id_publicacion]
    );
  }
};

module.exports = PublicacionModel;