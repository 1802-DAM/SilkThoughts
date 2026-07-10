
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const verificarToken = require('../middlewares/authMiddleware');
const verificarRol = require('../middlewares/rolMiddleware');

// Todas las rutas de este archivo requieren token Y rol de Administrador (id_rol = 3)
router.use(verificarToken, verificarRol(3));

router.get('/usuarios', AdminController.listarUsuarios);
router.patch('/usuarios/:id', AdminController.cambiarEstadoUsuario);

router.get('/psicologos/pendientes', AdminController.listarSolicitudesPsicologo);
router.patch('/psicologos/:id/aprobar', AdminController.aprobarPsicologo);
router.patch('/psicologos/:id/rechazar', AdminController.rechazarPsicologo);

router.get('/publicaciones/reportadas', AdminController.listarPublicacionesReportadas);
router.patch('/publicaciones/:id/moderar', AdminController.moderarPublicacion);

module.exports = router;