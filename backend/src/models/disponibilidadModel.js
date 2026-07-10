const db = require('../config/db');
const { buscarPorId } = require('./usuarioModel');

const DisponibilidadModel = {
    async crear({ id_psicologo, fecha, hora_inicio, hora_fin, modalidad_atencion })
    {
        const [result] = await db.query (
            `INSERT INTO DISPONIBILIDAD (id_psicologo, fecha, hora_inicio, hora_fin, modalidad_atencion)
                VALUES (?, ?, ?, ?, ?)`,
                [id_psicologo, fecha, hora_inicio, hora_fin, modalidad_atencion]
        );

        return result.insertId;
    },

    async listarPorPsicologo(id_psicologo) {
        const [rows] = await db.query (
            `SELECT * FROM DISPONIBILIDAD
            WHERE id_psicologo = ? AND estado_bloque = 'disponible'
            ORDER BY fecha ASC, hora_inicio ASC`,
            [id_psicologo]
        );

        return rows;
    },

    async buscarPorId(id_disponobilidad) {
        const [rows] = await db.query (
            `SELECT * FROM DISPONIBILIDAD WHERE id_disponibilidad = ? `,
            [id_disponobilidad]
        );

        return rows[0];
    },

    async marcarComoOcupado(id_disponobilidad) {
        await db.query (
            `UPDATE DISPONIBILIDAD SET estado_bloque = 'ocupado' WHERE id_disponibilidad = ? `,
            [id_disponobilidad] 
        );

    },

    async idPsicologoPorUsuario(id_usuario) {
        const [rows] = await db.query (
            `SELECT id_psicologo FROM PSICOLOGO WHERE id_usuario = ? `,
            [id_usuario]     
        );

        return rows [0]?.id_psicologo;
    }
};

module.exports = DisponibilidadModel;