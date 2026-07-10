const express = require('express');
const router = express.Router();
const AgendaController = require('../controllers/agendaController');
const verificarToken = require('../middlewares/authMiddleware');

// Disponibilidad
router.post('/disponibilidad', verificarToken, AgendaController.crearDisponibilidad);
router.get('/disponibilidad/:id_psicologo', AgendaController.listarDisponibilidadPorPsicologo);

// Reservas
router.post('/reservas', verificarToken, AgendaController.crearReserva);
router.get('/reservas/mis-reservas', verificarToken, AgendaController.misReservas);
router.get('/reservas/mi-agenda', verificarToken, AgendaController.miAgenda);
router.patch('/reservas/:id', verificarToken, AgendaController.actualizarEstadoReserva);

module.exports = router;