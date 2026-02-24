import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../configs/configs.js';

export const generateJWT = (userId, extraClaims = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        const payload = {
            sub: String(userId),
            jti: crypto.randomUUID(),
            iat: Math.floor(Date.now() / 1000),
            ...extraClaims,
        };
        const signOptions = {
            expiresIn: options.expiresIn || config.jwt.expiresIn,
            issuer: config.jwt.issuer,
            audience: config.jwt.audience,
        };
        jwt.sign(payload, config.jwt.secret, signOptions, (err, token) => {
            if (err) reject(err);
            else resolve(token);
        });
    });
};

export const verifyJWT = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.jwt.secret, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });
};

export const generateVerificationToken = (userId, type, expiresIn = '24h') => {
    return new Promise((resolve, reject) => {
        const payload = {
            sub: String(userId),
            type,
            iat: Math.floor(Date.now() / 1000),
        };
        const signOptions = {
            expiresIn,
            jwtid: crypto.randomUUID(),
            issuer: config.jwt.issuer,
            audience: config.jwt.audience,
        };
        jwt.sign(payload, config.jwt.secret, signOptions, (err, token) => {
            if (err) reject(err);
            else resolve(token);
        });
    });
};
export const verifyVerificationToken = (token) => verifyJWT(token);
