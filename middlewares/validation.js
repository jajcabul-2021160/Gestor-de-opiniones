import { body, validationResult } from 'express-validator';
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
                value: error.value,
            })),
        });
    }
    next();
};
// validaciones de Login, publicaciones y comentarios 
export const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 25 }).withMessage('El nombre no puede tener más de 25 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    body('surname')
        .trim()
        .notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ max: 25 }).withMessage('El apellido no puede tener más de 25 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),
    body('username')
        .trim()
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('El nombre de usuario solo puede tener letras, números y guión bajo'),
    body('email')
        .trim()
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('El correo electrónico no tiene un formato válido')
        .isLength({ max: 150 }).withMessage('El correo no puede tener más de 150 caracteres'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos una letra mayúscula')
        .matches(/[a-z]/).withMessage('La contraseña debe tener al menos una letra minúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe tener al menos un número'),

    handleValidationErrors,
];

export const validateLogin = [
    body('emailOrUsername')
        .trim()
        .notEmpty().withMessage('El email o nombre de usuario es requerido'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida'),
    handleValidationErrors,
];
export const validateVerifyEmail = [
    body('token')
        .notEmpty().withMessage('El token de verificación es requerido'),
    handleValidationErrors,
];

export const validateUpdateProfile = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre no puede estar vacío')
        .isLength({ max: 25 }).withMessage('El nombre no puede tener más de 25 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
    body('surname') 
        .optional()
        .trim()
        .notEmpty().withMessage('El apellido no puede estar vacío')
        .isLength({ max: 25 }).withMessage('El apellido no puede tener más de 25 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),
    body('username')
        .optional()
        .trim()
        .notEmpty().withMessage('El nombre de usuario no puede estar vacío')
        .isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('El nombre de usuario solo puede tener letras, números y guión bajo'),

    handleValidationErrors,
];
export const validateChangePassword = [
    body('currentPassword')
        .notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword')
        .notEmpty().withMessage('La nueva contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La nueva contraseña debe tener al menos una letra mayúscula')
        .matches(/[a-z]/).withMessage('La nueva contraseña debe tener al menos una letra minúscula')
        .matches(/[0-9]/).withMessage('La nueva contraseña debe tener al menos un número'),

    handleValidationErrors,
];
export const validatePublication = [
    body('title')
        .trim()
        .notEmpty().withMessage('El título es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El título debe tener entre 3 y 100 caracteres'),

    body('category')
        .trim()
        .notEmpty().withMessage('La categoría es obligatoria')
        .isIn(['Opinión', 'Tecnología', 'Deportes', 'Política', 'Entretenimiento', 'Educación', 'Salud', 'Otro'])
        .withMessage('La categoría no es válida'),

    body('content')
        .trim()
        .notEmpty().withMessage('El contenido es obligatorio')
        .isLength({ min: 10, max: 2000 }).withMessage('El contenido debe tener entre 10 y 2000 caracteres'),

    handleValidationErrors,
];
export const validateComment = [
    body('content')
        .trim()
        .notEmpty().withMessage('El comentario no puede estar vacío')
        .isLength({ min: 1, max: 500 }).withMessage('El comentario debe tener entre 1 y 500 caracteres'),

    handleValidationErrors,
];
