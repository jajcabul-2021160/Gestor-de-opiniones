import { verifyJWT } from '../helpers/generate-jwt.js';
import { User } from '../src/user/user.model.js';

export const validateJWT = async (req, res, next) => {
    try {
        let token =
            req.header('x-token') ||
            req.header('authorization') ||
            req.body.token ||
            req.query.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No existe token',
            });
        }

        token = token.replace(/^Bearer\s+/, '');
        const decoded = await verifyJWT(token);
        const user = await User.findById(decoded.sub).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token no válido - Usuario inexistente',
            });
        }

        if (!user.status) {
            return res.status(423).json({
                success: false,
                message: 'Cuenta desactivada o correo no verificado.',
            });
        }

        req.user = user;
        req.userId = user._id.toString();

        next();
    } catch (error) {
        console.error('Error validando JWT:', error);
        let message = 'Error al verificar el token';
        if (error.name === 'TokenExpiredError') message = 'Token expirado';
        else if (error.name === 'JsonWebTokenError') message = 'Token inválido';
        return res.status(401).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
