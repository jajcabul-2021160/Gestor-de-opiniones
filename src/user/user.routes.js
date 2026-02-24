import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from './user.controller.js';
import { validateUpdateProfile, validateChangePassword } from '../../middlewares/validation.js';

const router = Router();
// get
router.get('/profile', getProfile);
// put
router.put('/profile', validateUpdateProfile, updateProfile);
// put
router.put('/change-password', validateChangePassword, changePassword);
export default router;
 