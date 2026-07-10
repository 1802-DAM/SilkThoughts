
const express = require('express');
const router = express.Router();
const PsicologoController = require('../controllers/psicologoController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/postular', verificarToken, PsicologoController.postular);
router.get('/mi-solicitud', verificarToken, PsicologoController.miSolicitud);

module.exports = router;