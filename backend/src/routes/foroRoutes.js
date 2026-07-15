
const express = require('express');
const router = express.Router();
const ForoController = require('../controllers/foroController');
const verificarToken = require('../middlewares/authMiddleware');

// Rutas públicas, no requieren inicio de sesión.
router.get('/', ForoController.listarPublicaciones);
router.get('/:id', ForoController.obtenerPublicacion);


// Rutas protegidas, si requieren inicio de sesión.
router.post('/', verificarToken, ForoController.crearPublicacion);
router.post('/:id/comentarios', verificarToken, ForoController.crearComentario);
router.patch('/:id/reportar', verificarToken, ForoController.reportarPublicacion);

module.exports = router;