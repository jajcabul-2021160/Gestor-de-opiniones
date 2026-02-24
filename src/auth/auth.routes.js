import { Router } from 'express';
import { register, login, verifyEmail, resendVerification } from './auth.controller.js';
import { validateRegister, validateLogin, validateVerifyEmail } from '../../middlewares/validation.js';
import { authRateLimit, emailRateLimit } from '../../middlewares/request-limit.js';

const router = Router();

// rutas
router.post('/register', [authRateLimit, validateRegister], register);
router.post('/login', [authRateLimit, validateLogin], login);
router.post('/verify-email', validateVerifyEmail, verifyEmail);
router.post('/resend-verification', emailRateLimit, resendVerification);

export default router;
