
// src/controllers/adminController.js
const adminService = require('../services/adminService');

const AdminController = {
  async listarUsuarios(req, res) {
    try {
      const usuarios = await adminService.listarUsuarios();
      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async cambiarEstadoUsuario(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const resultado = await adminService.cambiarEstadoUsuario(id, estado);
      res.json(resultado);
    } catch (error) {
      console.error(error);

      if (error.tipo === 'VALIDACION') {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async listarSolicitudesPsicologo(req, res) {
    try {
      const solicitudes = await adminService.listarSolicitudesPsicologo();
      res.json(solicitudes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async aprobarPsicologo(req, res) {
    try {
      const { id } = req.params;
      const resultado = await adminService.aprobarPsicologo(id);
      res.json(resultado);
    } catch (error) {
      console.error(error);

      if (error.tipo === 'NO_ENCONTRADA') {
        return res.status(404).json({ message: error.message });
      }
      if (error.tipo === 'CONFLICTO') {
        return res.status(409).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async rechazarPsicologo(req, res) {
    try {
      const { id } = req.params;
      const resultado = await adminService.rechazarPsicologo(id);
      res.json(resultado);
    } catch (error) {
      console.error(error);

      if (error.tipo === 'NO_ENCONTRADA') {
        return res.status(404).json({ message: error.message });
      }
      if (error.tipo === 'VALIDACION') {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async listarPublicacionesReportadas(req, res) {
    try {
      const publicaciones = await adminService.listarPublicacionesReportadas();
      res.json(publicaciones);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async moderarPublicacion(req, res) {
    try {
      const { id } = req.params;
      const { accion } = req.body;

      const resultado = await adminService.moderarPublicacion(id, accion);
      res.json(resultado);
    } catch (error) {
      console.error(error);

      if (error.tipo === 'VALIDACION') {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },
};

module.exports = AdminController;