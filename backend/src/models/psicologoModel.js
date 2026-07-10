
const db = require('../config/db');

const PsicologoModel = {
  async buscarPorUsuario(id_usuario) {
    const [rows] = await db.query(
      `SELECT id_psicologo, id_usuario, especialidad, anios_experiencia, modalidad_atencion,
              telefono_contacto, numero_colegiado, universidad_titulacion, anio_titulacion,
              documento_credencial, verificado, fecha_verificacion
       FROM PSICOLOGO
       WHERE id_usuario = ?`,
      [id_usuario]
    );

    return rows[0];
  },

  async crearSolicitud({
    id_usuario,
    especialidad,
    anios_experiencia,
    modalidad_atencion,
    telefono_contacto,
    numero_colegiado,
    universidad_titulacion,
    anio_titulacion,
    documento_credencial
  }) {
    const [result] = await db.query(
      `INSERT INTO PSICOLOGO
      (id_usuario, especialidad, anios_experiencia, modalidad_atencion, telefono_contacto,
       numero_colegiado, universidad_titulacion, anio_titulacion, documento_credencial, verificado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        id_usuario,
        especialidad,
        anios_experiencia,
        modalidad_atencion,
        telefono_contacto,
        numero_colegiado,
        universidad_titulacion,
        anio_titulacion,
        documento_credencial
      ]
    );

    return result.insertId;
  },

  async aprobarSolicitud(id_psicologo) {
    await db.query(
      `UPDATE PSICOLOGO
       SET verificado = 1,
           fecha_verificacion = NOW()
       WHERE id_psicologo = ?`,
      [id_psicologo]
    );
  },

  async eliminarSolicitud(id_psicologo) {
    await db.query(
      `DELETE FROM PSICOLOGO
       WHERE id_psicologo = ?`,
      [id_psicologo]
    );
  },

async listarPendientes() {
  const [rows] = await db.query(
    `SELECT p.id_psicologo, p.id_usuario, p.especialidad, p.anios_experiencia,
            p.modalidad_atencion, p.telefono_contacto, p.numero_colegiado,
            p.universidad_titulacion, p.anio_titulacion, p.documento_credencial,
            u.nombre, u.correo
     FROM PSICOLOGO p
     JOIN USUARIO u ON p.id_usuario = u.id_usuario
     WHERE p.verificado = 0
     ORDER BY p.id_psicologo DESC`
  );

  return rows;
},

  async buscarPorId(id_psicologo) {
    const [rows] = await db.query(
      `SELECT *
       FROM PSICOLOGO
       WHERE id_psicologo = ?`,
      [id_psicologo]
    );

    return rows[0];
  }
};

module.exports = PsicologoModel;