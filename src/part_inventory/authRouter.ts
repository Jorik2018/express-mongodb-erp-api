import { Request, Response, Router } from 'express';
import passport from 'passport';

const authRouter = Router();

authRouter.get('/login/github', passport.authenticate('github'));

authRouter.get('/logout', (req: Request, res: Response) => {
    delete req.session.token;
    delete req.session.passport;
    req.logout();
    res.redirect('/login');
});

authRouter.get('/login',
    passport.authenticate('github', { failureRedirect: '/' }),
    (_req: Request, res: Response) => {
        res.redirect('/');
    });


export default authRouter;

