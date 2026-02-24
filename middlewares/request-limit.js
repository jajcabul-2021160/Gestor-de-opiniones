import rateLimit from 'express-rate-limit';
import { config } from '../configs/configs.js';

export const requestLimit = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ 
            success: false,
            message: 'Demasiadas peticiones desde esta IP, intentalo más tarde',
            retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
        });
    },
});

export const authRateLimit = rateLimit({
    windowMs: config.rateLimit.authWindowMs,
    max: config.rateLimit.authMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log(`Rate limit excedido para IP: ${req.ip} en ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Demasiados intentos de autenticación, intentalo más tarde',
            retryAfter: Math.ceil(config.rateLimit.authWindowMs / 1000),
        });
    },
});

export const emailRateLimit = rateLimit({
    windowMs: config.rateLimit.emailWindowMs,
    max: config.rateLimit.emailMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Demasiados emails enviados, intentalo más tarde.',
            retryAfter: Math.ceil(config.rateLimit.emailWindowMs / 1000),
        });
    },
});
