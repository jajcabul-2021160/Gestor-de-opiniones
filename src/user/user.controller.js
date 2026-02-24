import { User } from './user.model.js';
import { hashPassword, verifyPassword } from '../../utils/password-utils.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la cuenta de usuario.',
            });
        }
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Error en getProfile:', error);
        return res.status(500).json({
            success: false,
            message: 'Problema técnico en el servidor.',
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, surname, username } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (surname) updateData.surname = surname;

        if (username) {
            const usernameExists = await User.findOne({
                username: username.toLowerCase(),
                _id: { $ne: req.userId },
            });

            if (usernameExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Ese nombre de usuario ya se encuentra registrado.',
                });
            }
            updateData.username = username.toLowerCase();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se enviaron parámetros para modificar.',
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Los datos del perfil se guardaron correctamente.',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                surname: updatedUser.surname,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        console.error('Error en updateProfile:', error);
        return res.status(500).json({
            success: false,
            message: 'Error inesperado al procesar la actualización.',
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'El usuario solicitado no existe.',
            });
        }

        const isValid = await verifyPassword(user.password, currentPassword);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'La clave actual no coincide con nuestros registros.',
            });
        }

        const isSamePassword = await verifyPassword(user.password, newPassword);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'La clave nueva debe ser distinta a la que usas actualmente.',
            });
        }

        const hashedNewPassword = await hashPassword(newPassword);

        await User.findByIdAndUpdate(req.userId, { password: hashedNewPassword });

        return res.status(200).json({
            success: true,
            message: 'La clave de acceso ha sido cambiada con éxito.',
        });
    } catch (error) {
        console.error('Error en changePassword:', error);
        return res.status(500).json({
            success: false,
            message: 'Fallo interno al intentar modificar la contraseña.',
        });
    }
}; 