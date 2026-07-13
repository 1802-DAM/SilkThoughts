
const DisponibilidadModel = require('../models/disponibilidadModel');
const ReservaModel = require('../models/reservaModel');

const AgendaController = {
  // Psicólogo registra un bloque de disponibilidad
  async crearDisponibilidad(req, res) {
    try {
      const { fecha, hora_inicio, hora_fin, modalidad_atencion } = req.body;
      const id_psicologo = await DisponibilidadModel.idPsicologoPorUsuario(req.usuario.id_usuario);

      if (!id_psicologo) {
        return res.status(403).json({ message: 'Solo un psicólogo verificado puede registrar disponibilidad.' });
      }

      if (!fecha || !hora_inicio || !hora_fin) {
        return res.status(400).json({ message: 'Fecha, hora de inicio y hora de fin son obligatorias.' });
      }

      const id_disponibilidad = await DisponibilidadModel.crear({
        id_psicologo, fecha, hora_inicio, hora_fin, modalidad_atencion
      });

      res.status(201).json({ message: 'Disponibilidad registrada.', id_disponibilidad });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  // Cualquier usuario puede ver la disponibilidad de un psicólogo específico
  async listarDisponibilidadPorPsicologo(req, res) {
    try {
      const { id_psicologo } = req.params;
      const bloques = await DisponibilidadModel.listarPorPsicologo(id_psicologo);
      res.json(bloques);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  // Paciente reserva un bloque de disponibilidad
  async crearReserva(req, res) {
    try {
      const { id_disponibilidad } = req.body;
      const id_usuario_paciente = req.usuario.id_usuario;

      const bloque = await DisponibilidadModel.buscarPorId(id_disponibilidad);
      if (!bloque) {
        return res.status(404).json({ message: 'Bloque de disponibilidad no encontrado.' });
      }
      if (bloque.estado_bloque !== 'disponible') {
        return res.status(409).json({ message: 'Este bloque ya no está disponible.' });
      }

      const id_reserva = await ReservaModel.crear({ id_disponibilidad, id_usuario_paciente });
      await DisponibilidadModel.marcarComoOcupado(id_disponibilidad);

      res.status(201).json({ message: 'Reserva confirmada exitosamente.', id_reserva });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  // Paciente ve sus propias reservas
  async misReservas(req, res) {
    try {
      const reservas = await ReservaModel.listarPorPaciente(req.usuario.id_usuario);
      res.json(reservas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  // Psicólogo ve su agenda de reservas
  async miAgenda(req, res) {
    try {
      const id_psicologo = await DisponibilidadModel.idPsicologoPorUsuario(req.usuario.id_usuario);
      if (!id_psicologo) {
        return res.status(403).json({ message: 'Solo un psicólogo puede ver su agenda.' });
      }
      const reservas = await ReservaModel.listarPorPsicologo(id_psicologo);
      res.json(reservas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  },

  // Psicólogo cambia el estado de una reserva (confirmar/cancelar)
  async actualizarEstadoReserva(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ['confirmada', 'cancelada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: 'Estado inválido.' });
      }

      await ReservaModel.actualizarEstado(id, estado);
      res.json({ message: `Reserva actualizada a estado: ${estado}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
};

module.exports = AgendaController;