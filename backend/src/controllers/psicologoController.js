
// src/controllers/psicologoController.js
const psicologoService = require('../services/psicologoService');

const PsicologoController = {
  async postular(req, res) {
    try {
      const usuario = {
        id_usuario: req.usuario.id_usuario,
        id_rol: req.usuario.id_rol,
      };

      const resultado = await psicologoService.crearSolicitudPostulacion(req.body, usuario);

      res.status(201).json(resultado);
    } catch (error) {
      console.error(error);

      if (error.tipo === 'PERMISO') {
        return res.status(403).json({ message: error.message });
      }
      if (error.tipo === 'VALIDACION') {
        return res.status(400).json({ message: error.message });
      }
      if (error.tipo === 'CONFLICTO') {
        return res.status(409).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async miSolicitud(req, res) {
    try {
      const id_usuario = req.usuario.id_usuario;
      const solicitud = await psicologoService.obtenerMiSolicitud(id_usuario);
      res.json(solicitud);
    } catch (error) {
      console.error(error);

      if (error.tipo === 'NO_ENCONTRADA') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },
};

module.exports = PsicologoController;