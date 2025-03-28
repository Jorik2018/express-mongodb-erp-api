import User from '../database/models/user';
import { hashPassword, comparePassword } from '../utils/auth';
import jwt, { Secret } from 'jsonwebtoken';
import AWS from 'aws-sdk';
import { SendEmailRequest, SendEmailResponse } from 'aws-sdk/clients/ses';
import { Request, Response, NextFunction } from 'express';

const awsConfig = {
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
	apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

export const register = async (req: Request, res: Response) => {
	// res.json('REGISTER USER RESPONSE FROM CONTROLLER');
	try {

		const { name, lastname, email, password } = req.body;
		//validacion
		if (!name) {
			return res.status(400).send(`NAME IS REQUIRED`);
		}
		if (!lastname) {
			return res.status(400).send(`LAST NAME IS REQUIRED`);
		}
		if (!password || password.length < 6) {
			return res
				.status(400)
				.send(
					`PASSWORD IS REQUIRED AND SHOULD BE MIN 6 CHARACTERS LONG`
				);
		}
		//valido que el usuario no exista por el email
		let userExist = await User.findOne({ email }).select('-password').exec();
		if (userExist) {
			console.log(userExist);
			return res.status(400).send(`EMAIL IS TAKEN`);
		}

		//hasheo el password
		const hashedPassword = await hashPassword(password);

		//register
		const today = new Date();
		const user = new User({
			...req.body,
			name,
			lastname,
			email,
			password: hashedPassword,
			date: today
		});

		//guardo el usuario
		return await user.save().then(user => {
			console.log(`SAVED USER: ${user}`);
			const { password, ...other } = user;
			const payload = {
				fullName: user.lastname,
				...other
			};
			let token = jwt.sign(payload, process.env.JWT_SECRET as Secret, {
				expiresIn: 1440
			});
			const params: SendEmailRequest = {
				Source: process.env.EMAIL_FROM!,
				Destination: {
					ToAddresses: [email],
				},
				ReplyToAddresses: [process.env.EMAIL_FROM!],
				Message: {
					Body: {
						Html: {
							Charset: 'UTF-8',
							Data: `
								<html>
									<h1>Bienvenido!</h1>
									<p>Gracias por registrarte!</p>
	
								</html>`,
						},
					},
					Subject: {
						Charset: 'UTF-8',
						Data: 'Password Reset Code',
					},
				},
			};
			/*SES.sendEmail(params, (err, data) => {
				if (err:any) {
					console.log(err:any);
					return res.json({ ok: false });
				} else {
					console.log(data);
					return res.json({ ok: true });
				}
			});*/
			const { profileImage, followers, name } = user;
			return res.status(200).json({ profileImage, followers, name, token });
		});
	} catch (err:any) {
		console.log(err);
		return res.status(400).send(`ERROR: ${err}`);
	}
};

export const login = (req: Request, res: Response, next: NextFunction) => {

	const { email, password } = req.body;

	if (!password || password.length < 6) {
		return res
			.status(400)
			.send(
				`PASSWORD IS REQUIRED AND SHOULD BE MIN 6 CHARACTERS LONG`
			);
	}
	//chequeo que exista el usuario
	User.findOne({ email }).lean().exec().then(user => {
		if (!user) {
			// const error = new Error('A user with this email could not be found');
			// error.statusCode = 401;
			// throw error;
			return res.status(400).send(`NO USER FOUND`);
		}
		//chequeo password
		comparePassword(password, user.password).then((match: boolean) => {
			if (!match) {
				// const error = new Error('Wrong Password');
				// error.statusCode = 401;
				// throw error;
				return res.status(400).send(`PASSWORD IS INCORRECT`);
			}
			const payload = {
				id: user._id,
				name: user.name,
				lastname: user.lastname,
				email: user.email
			};
			const { JWT_SECRET } = require('../config').default;
			const token = jwt.sign(payload, JWT_SECRET as Secret, {
				expiresIn: '7d',
			}/*,
				(err, token) => {
					if (err:any) throw err;
					res.json({ token });
				}*/);
			//return user and token to client, exclude hashed password

			// send token in cookie
			res.cookie('token', token, {
				httpOnly: true,
				// secure: true, //solo funciona en https
			});
			//send user as json response
			//res.json({ token: token });
			const { password, _id, ...other } = user;
			console.log(other);
			delete (user as any).password;
			res.status(200).json(
				{
					token,
					id: _id,
					//userId: user._id.toString(),
					...other
				});
		});
	}).catch(error => {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
		res.status(400).send('ERROR. TRY AGAIN.');
	});
};

export const logout = async (req: Request, res: Response) => {
	try {
		res.clearCookie('token');
		return res.json({ message: 'SIGNOUT SUCCESS' });
	} catch (error) {
		console.log(error);
	}
};

export const currentUser = async (req: Request, res: Response) => {
	try {
		const user = await User.findById((req as any).user.id)
			.select('-password')
			.exec();
		console.log(`CURRENT USER ${user}`);
		return res.json({ ok: true });
	} catch (error) {
		console.log(error);
	}
};

export const sendTestEmail = async (req: Request, res: Response) => {
	// console.log('SEND EMAIL');
	// res.json({ ok: true });
	const params = {
		Source: process.env.EMAIL_FROM,
		Destination: {
			ToAddresses: [process.env.EMAIL_FROM],
		},
		ReplyToAddresses: [process.env.EMAIL_FROM],
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: `
						<html>
							<h1>Reset password link</h1>
							<p>Por favor, haz click en el siguiente link para resetear tu contraseña</p>
						</html>`,
				},
			},
			Subject: {
				Charset: 'UTF-8',
				Data: 'Password Reset Link',
			},
		},
	};
	const emailSent = SES.sendEmail(params as SendEmailRequest, (err, data) => {
		if (err) {
			console.log(err);
			return res.json({ ok: false });
		} else {
			console.log(data);
			return res.json({ ok: true });
		}
	});
};

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		// console.log(email);
		const { nanoid } = await import('nanoid');
		const shortCode = nanoid(6).toUpperCase();
		const user = await User.findOneAndUpdate(
			{ email },
			{ passwordResetCode: shortCode }
		);
		if (!user) return res.status(400).send(`USER NOT FOUND`);
		//PREPARAMOS PARA EL EMAIL
		const params = {
			Source: process.env.EMAIL_FROM,
			Destination: {
				ToAddresses: [email],
			},
			ReplyToAddresses: [process.env.EMAIL_FROM],
			Message: {
				Body: {
					Html: {
						Charset: 'UTF-8',
						Data: `
							<html>
								<h1>Reset password link</h1>
								<p>Por favor, usa este codigo para resetear tu contraseña</p>
								<h2>${shortCode}</h2>
							</html>`,
					},
				},
				Subject: {
					Charset: 'UTF-8',
					Data: 'Password Reset Code',
				},
			},
		};
		SES.sendEmail(params as SendEmailRequest, (err, data) => {
			if (err) {
				console.log(err);
				return res.json({ ok: false });
			} else {
				console.log(data);
				return res.json({ ok: true });
			}
		});
	} catch (error) {
		res.send(`AN ERROR OCURRED`);
		console.log(error);
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { email, code, newPassword } = req.body;
		console.table({ email, code, resetPassword });
		const hashedPassword = await hashPassword(newPassword);
		const user = await User.findOneAndUpdate(
			{ email, passwordResetCode: code },
			{ password: hashedPassword, passwordResetCode: '' }
		).exec();
		res.json({ ok: true });
	} catch (error) {
		console.log(error);
		return res.status(400).send(`ERROR`);
	}
};
