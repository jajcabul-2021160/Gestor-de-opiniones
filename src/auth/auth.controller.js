import { User } from '../user/user.model.js';
import { hashPassword, verifyPassword } from '../../utils/password-utils.js';
import { generateJWT, generateVerificationToken, verifyVerificationToken } from '../../helpers/generate-jwt.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../../helpers/email-service.js';

export const register = async (req, res) => {
    try {
        const { name, surname, username, email, password } = req.body;

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() },
            ],
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'correo electrónico' : 'nombre de usuario';
            return res.status(409).json({
                success: false,
                message: `El ${field} ya está registrado.`,
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            surname,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            status: false,
            emailVerified: false,
        });

        const verificationToken = await generateVerificationToken(user._id, 'EMAIL_VERIFICATION');

        await User.findByIdAndUpdate(user._id, {
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        sendVerificationEmail(user.email, user.name, verificationToken)
            .then(() => console.log(`Email de verificación enviado a: ${user.email}`))
            .catch((err) => console.error('Error enviando email:', err.message));

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente. Por favor verifica tu correo para activar tu cuenta.',
            user: {
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error en register:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al registrar el usuario.',
        });
    }
};

export const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase() },
                { username: emailOrUsername.toLowerCase() },
            ],
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.',
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Correo no verificado. Por favor revisa tu bandeja de entrada.',
            });
        }

        if (!user.status) {
            return res.status(403).json({
                success: false,
                message: 'Cuenta desactivada. Contacta al administrador.',
            });
        }

        const isValidPassword = await verifyPassword(user.password, password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.',
            });
        }

        const token = await generateJWT(user._id.toString(), { role: user.role });

        return res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                id: user._id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al iniciar sesión.',
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        let decoded;
        try {
            decoded = await verifyVerificationToken(token);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Token de verificación inválido o expirado.',
            });
        }

        if (decoded.type !== 'EMAIL_VERIFICATION') {
            return res.status(400).json({
                success: false,
                message: 'Token no válido para verificación de email.',
            });
        }

        const user = await User.findOne({
            _id: decoded.sub,
            emailVerificationToken: token,
            emailVerificationTokenExpiry: { $gt: new Date() },
        }).select('+emailVerificationToken +emailVerificationTokenExpiry');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado. Por favor solicita un nuevo correo de verificación.',
            });
        }

        if (user.emailVerified) {
            return res.status(200).json({
                success: true,
                message: 'El correo ya fue verificado anteriormente.',
            });
        }

        await User.findByIdAndUpdate(user._id, {
            emailVerified: true,
            status: true,
            emailVerificationToken: null,
            emailVerificationTokenExpiry: null,
        });

        // Enviar gmail de bienvenida
        sendWelcomeEmail(user.email, user.name)
            .catch((err) => console.error('Error enviando email de bienvenida:', err.message));

        return res.status(200).json({
            success: true,
            message: '¡Correo verificado exitosamente! Tu cuenta ha sido activada.',
        });
    } catch (error) {
        console.error('Error en verifyEmail:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al verificar el email.',
        });
    }
};

export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+emailVerificationToken +emailVerificationTokenExpiry');

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'Si el correo está registrado, recibirás un nuevo email de verificación.',
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Este correo ya fue verificado.',
            });
        }

        const verificationToken = await generateVerificationToken(user._id, 'EMAIL_VERIFICATION');

        await User.findByIdAndUpdate(user._id, {
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        sendVerificationEmail(user.email, user.name, verificationToken)
            .then(() => console.log(`Email de verificación reenviado a: ${user.email}`))
            .catch((err) => console.error('Error reenviando email:', err.message));

        return res.status(200).json({
            success: true,
            message: 'Si el correo está registrado, recibirás un nuevo email de verificación.',
        });
    } catch (error) {
        console.error('Error en resendVerification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor.',
        });
    }
};
