
const PublicacionModel = require('../models/publicacionModel');
const ComentarioModel = require('../models/comentarioModel');

const ForoController = {
  async crearPublicacion(req, res) {
    try {
      const { titulo, contenido } = req.body;
      const id_usuario_autor = req.usuario.id_usuario;

      if (!titulo || !contenido) {
        return res.status(400).json({ message: 'Título y contenido son obligatorios.' });
      }

      const id_publicacion = await PublicacionModel.crear({ id_usuario_autor, titulo, contenido });
      res.status(201).json({ message: 'Publicación creada exitosamente.', id_publicacion });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async listarPublicaciones(req, res) {
    try {
      const publicaciones = await PublicacionModel.listarTodas();
      res.json(publicaciones);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async obtenerPublicacion(req, res) {
    try {
      const { id } = req.params;
      const publicacion = await PublicacionModel.buscarPorId(id);

      if (!publicacion || publicacion.estado_publicacion !== 'visible') {
        return res.status(404).json({ message: 'Publicación no encontrada.' });
      }

      const comentarios = await ComentarioModel.listarPorPublicacion(id);
      res.json({ ...publicacion, comentarios });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async crearComentario(req, res) {
    try {
      const { id } = req.params;
      const { contenido } = req.body;
      const id_usuario_autor = req.usuario.id_usuario;

      if (!contenido) {
        return res.status(400).json({ message: 'El comentario no puede estar vacío.' });
      }

      const publicacion = await PublicacionModel.buscarPorId(id);

      if (!publicacion || publicacion.estado_publicacion !== 'visible') {
        return res.status(404).json({ message: 'No se puede comentar una publicación no disponible.' });
      }

      const id_comentario = await ComentarioModel.crear({
        id_publicacion: id,
        id_usuario_autor,
        contenido
      });

      res.status(201).json({ message: 'Comentario agregado.', id_comentario });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  async reportarPublicacion(req, res) {
    try {
      const { id } = req.params;

      const publicacion = await PublicacionModel.buscarPorId(id);

      if (!publicacion) {
        return res.status(404).json({ message: 'Publicación no encontrada.' });
      }

      if (publicacion.estado_publicacion === 'eliminada') {
        return res.status(400).json({ message: 'No se puede reportar una publicación eliminada.' });
      }

      if (publicacion.estado_publicacion === 'reportada') {
        return res.status(409).json({ message: 'La publicación ya fue reportada.' });
      }

      await PublicacionModel.actualizarEstado(id, 'reportada');

      res.json({ message: 'Publicación reportada correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
};

module.exports = ForoController;