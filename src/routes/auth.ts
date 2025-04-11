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
	router.use(authMiddleware)
	router.get('/logout', logout);
	router.get('/current-user', currentUser);
	router.post('/change-password', changePassword as any);
	return router;
}
export default build;
