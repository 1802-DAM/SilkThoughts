
function verificarRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.id_rol)) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a este recurso.' });
        }
        next();
    };
}

module.exports = verificarRol;