const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuarioModel');

const SAL_ROUNDS = 10;

const AuthController = {
    async registrar(req, res) {
        try {
            const { nombre, correo, contrasena } = req.body;

            if (!nombre || !correo || !contrasena) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios.'});
            
            }

            const usuarioExistente = await UsuarioModel.buscarPorCorreo(correo);
            if (usuarioExistente) {
                return res.status(409).json({ message: 'Este correo ya se encuentra registrado.'});
            }

            const contrasena_hash = await bcrypt.hash(contrasena, SAL_ROUNDS);

            // id_rol = 1 corresponde con "Paciente" (sera un registro publico)
            const id_usuario = await UsuarioModel.crear({
                nombre,
                correo,
                contrasena_hash,
                id_rol: 1
            });

            res.status(201).json({
                message: 'Cuenta creada exitosamente.',
                usuario: { id_usuario, nombre, correo }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor.'});
        }
    },

    async login (req, res) {
        try {
            const { correo, contrasena } = req.body;

            if (!correo || !contrasena) {
                return res.status(400).json({ message: 'Correo y contraseña son obligatorios.'});
            }

            const usuario = await UsuarioModel.buscarPorCorreo(correo);
            if (!usuario) {
                return res.status(401).json({ message: 'Credenciales incorrectas.'});
            }
            
            const coincide = await bcrypt.compare(contrasena, usuario.contrasena_hash);
            if (!coincide) {
                return res.status(401).json({ message: 'Credenciales incorrectas.'});
            }

          
            const token = jwt.sign(
                { id_usuario: usuario.id_usuario, id_rol: usuario.id_rol },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            res.json({
                message: 'Inicio de sesión exitoso.',
                token,
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    id_rol: usuario.id_rol
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor.'});
        }
    }

};

module.exports = AuthController;