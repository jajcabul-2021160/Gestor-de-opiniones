import dotenv from 'dotenv';
dotenv.config();

export const config = {
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: process.env.JWT_ISSUER || 'gestoropiniones',
        audience: process.env.JWT_AUDIENCE || 'opinions-users',
    },

    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        enableSsl: process.env.SMTP_ENABLE_SSL === 'true',
        username: process.env.SMTP_USERNAME,
        password: process.env.SMTP_PASSWORD,
        fromEmail: process.env.EMAIL_FROM,
        fromName: process.env.EMAIL_FROM_NAME || 'gestoropiniones',
    },

    rateLimit: {
        windowMs: 1 * 60 * 1000,      
        maxRequests: 30,
        authWindowMs: 1 * 60 * 1000,   
        authMaxRequests: 5,
        emailWindowMs: 15 * 60 * 1000, 
        emailMaxRequests: 3,
    },

    security: {
        passwordMinLength: 8,
    },

    app: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3006/gestoropiniones/v1',
    },
};
