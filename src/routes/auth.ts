import { Router } from 'express';
import {
	currentUser,
	forgotPassword,
	resetPassword,
	login,
	logout,
	register,
	sendTestEmail,
	changePassword
} from '../controllers/auth';
import { requireSignin } from '../middlewares';

const build = (authMiddleware?: any) => {
	const router = Router();

	router.post('/register', register);
	router.post('/login', login);
	router.get('/send-email', sendTestEmail);
	router.post('/forgot-password', forgotPassword);
	router.post('/reset-password', resetPassword);

	router.get('/logout', authMiddleware, logout);
	router.get('/current-user', requireSignin, currentUser);
	router.post('/change-password', authMiddleware, changePassword);

	return router;
}
export default build;
