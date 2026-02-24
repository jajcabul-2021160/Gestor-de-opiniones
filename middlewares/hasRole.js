/**
 * Middleware para restringir acceso por rol
 * @param {...string} roles 
 */
export const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({ 
                success: false,
                message: 'Se necesita validar el token antes de verificar el rol',
            });
        }

        const hasPermission = roles.includes(req.user.role);

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se necesita uno de estos roles: [${roles.join(', ')}]`,
            });
        }

        next();
    };
};
