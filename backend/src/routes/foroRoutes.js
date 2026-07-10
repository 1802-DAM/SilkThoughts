const express = require('express');
const router = express.Router();
const ForoController = require ('../controllers/foroController');
const verificarToken = require ('../middlewares/authMiddleware');

//Uso de rutas publicas, para que pueda explorar el foro sin necesidad de inicio de sesión. 
router.get('/', ForoController.listarPublicaciones);
router.get('/:id', ForoController.obtenerPublicacion);

//Rutas que estaran protegidas, si requieren inicio de sesión.

router.post('/', verificarToken, ForoController.crearPublicacion);
router.post('/:id/comentarios', verificarToken, ForoController.crearComentario);
router.patch('/:id/reportar', verificarToken, ForoController.reportarPublicacion);

module.exports = router;