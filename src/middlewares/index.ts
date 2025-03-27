import { expressjwt } from "express-jwt";
import { Request, Response } from 'express';

export const requireSignin = expressjwt({
	getToken: (req: Request) => req.cookies.token,
	secret: process.env.JWT_SECRET!,
	algorithms: ['HS256'],
});
