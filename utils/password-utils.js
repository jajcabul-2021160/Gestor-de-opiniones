import argon2 from 'argon2';
import { config } from '../configs/configs.js';

export const hashPassword = async (password) => {
    try {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536,  
            timeCost: 3,
            parallelism: 4,
            hashLength: 32,
            saltLength: 16,
        });
    } catch (error) {
        throw new Error('Fallo al realizar el cifrado de la clave');
    }
};

export const verifyPassword = async (hashedPassword, plainPassword) => {
    try {
        return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
        console.error('Inconveniente al validar la credencial:', error.message);
        return false;
    }
};

export const validatePasswordStrength = (password) => {
    const errors = [];

    if (password.length < config.security.passwordMinLength) {
        errors.push(`La clave requiere una longitud mínima de ${config.security.passwordMinLength} caracteres`);
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Es necesario incluir una letra en mayúsculas');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Se debe integrar al menos una letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('El código debe contener por lo menos un dígito numérico');
    }

    return {
        isValid: errors.length === 0,
        errors, 
    };
};