import nodemailer from 'nodemailer';
import { config } from '../configs/configs.js';

const createTransporter = () => {
    if (!config.smtp.username || !config.smtp.password) {
        console.warn('SMTP no configurado. El envío de emails no va a funcionar.');
        return null;
    } 

    return nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.enableSsl,
        auth: {
            user: config.smtp.username,
            pass: config.smtp.password,
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 10_000,
        tls: { rejectUnauthorized: false },
    });
};

const transporter = createTransporter();
export const sendVerificationEmail = async (email, name, verificationToken) => {
    if (!transporter) throw new Error('Transporter SMTP no configurado');

    const verificationUrl = `${config.app.frontendUrl}/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
    from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
    to: email,
    subject: 'Verifica tu correo electrónico - Opinions System',
    text: `Hola ${name},\n\nPara activar tu cuenta, copia y pega este enlace en tu navegador: ${verificationUrl}\n\nEste enlace expirará en 24 horas.`
};

    await transporter.sendMail(mailOptions);
};


export const sendWelcomeEmail = async (email, name) => {
    if (!transporter) return;

    const mailOptions = {
        from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
        to: email,
        subject: '¡Cuenta activada! - Opinions System',
        text: `¡Hola, ${name}!\n\nTu cuenta ha sido verificada y activada exitosamente. Ya puedes compartir tus opiniones.\n\n¡Bienvenido a la comunidad de Opinions System!`
    };

    await transporter.sendMail(mailOptions);
};
