const db = require ('../config/db');

const ComentarioModel = {
    async crear ({ id_publicacion, id_usuario_autor, contenido}) {
        const [result] = await db.query (
            `INSERT INTO COMENTARIO (id_publicacion, id_usuario_autor, contenido)  VALUES (?, ?, ?)`,
            [id_publicacion, id_usuario_autor, contenido]
        );

        return result.insertId;
    },

    async listarPorPublicacion(id_publicacion) {
        const [rows] = await db.query (
           `SELECT c.id_comentario, c.contenido, c.fecha_creacion, u.nombre AS autor
            FROM COMENTARIO c
            JOIN USUARIO u ON c.id_usuario_autor = u.id_usuario
            WHERE c.id_publicacion = ? AND c.estado_comentario = 'visible'
            ORDER BY c.fecha_creacion ASC`,
            [id_publicacion]
        );
        return rows;
    }
};

module.exports = ComentarioModel;