import { Router } from 'express';
import {
	currentUser,
	forgotPassword,
	resetPassword,
	login,
	logout,
	register,
	sendTestEmail,
} from '../controllers/auth';
import { requireSignin } from '../middlewares';
import multer from 'multer';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/current-user', requireSignin, currentUser);
router.get('/send-email', sendTestEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
