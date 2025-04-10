import User, { IUser } from '../database/models/user';
import { hashPassword, comparePassword } from '../utils/auth';
import jwt, { Secret } from 'jsonwebtoken';
import AWS from 'aws-sdk';
import { SendEmailRequest, SendEmailResponse } from 'aws-sdk/clients/ses';
import { Request, Response, NextFunction } from 'express';
import Company from '../database/models/company';
import Brand from '../database/models/brand';
import Contact from '../database/models/contact';
import Temporal from '../database/models/temporal';
import { Types } from 'mongoose';

export const register = async ({ body }: Request, res: Response) => {
	// res.json('REGISTER USER RESPONSE FROM CONTROLLER');
	try {

		const { name, lastname, email, password, isAdvertiser, preferences, company, brand, slogan, social, profileImage } = body;

		if (!name) {
			throw `NAME IS REQUIRED`;
		}
		if (!social) {
			if (!password || password.length < 6) {
				throw `PASSWORD IS REQUIRED AND SHOULD BE MIN 6 CHARACTERS LONG`
			}
		}
		//valido que el usuario no exista por el email
		let userExist = await User.findOne({ email }).select('-password').exec();
		if (userExist) {
			throw `EMAIL IS TAKEN`;
		}

		const bindContact = (user: any, contact: any) => {
			if(contact)user.profileImage=contact.profileImage;
			if (isAdvertiser) {
				return (new Company({ name: company, user: user._id })).save().then(({ _id }) =>
					(new Brand({ name: brand, company: _id, categories: preferences, user: user._id, slogan })).save()
						.then(() => {
							return createResponse(user, res);
						})
				)
			} else {
				return contact.save().then(() => {
					return createResponse(user, res);
				})
			}
		}

		const { v4: uuidv4 } = require('uuid');

		await hashPassword(password || uuidv4()).then(hashedPassword => {
			const user = new User({
				...body,
				name,
				lastname,
				email,
				password: hashedPassword,
				roles: isAdvertiser ? ['Sponsor'] : []
			});
			return user.save().then(({ _doc: user }: any) => {
				const contact = new Contact({ name, categories: preferences, user: user._id, profileImage });
				if (social) {
					Temporal.findOne({ _id: Types.ObjectId.createFromHexString(social) }).lean().then((temporal: any) => {
						contact.socials = new Map(Object.entries(JSON.parse(temporal.content)));
						return bindContact(user, contact);
					})
				} else {
					return bindContact(user, contact);
				}

			});
		});
		
	} catch (err) {
		if (typeof err == 'string') {
			return res.status(400).send({ error: err });
		}
		return res.status(400).send(err);
	}
};

const createResponse = (user: any, res: Response) => {

	const params: SendEmailRequest = {
		Source: process.env.EMAIL_FROM!,
		Destination: {
			ToAddresses: [user.email],
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

	return generateToken(res, user);
}

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
			return generateToken(res, user)
		});
	}).catch(error => {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
		res.status(400).send('ERROR. TRY AGAIN.');
	});
};

const generateToken = (res: Response, user: any) => {
	const { JWT_SECRET } = require('../config').default;
	const token = jwt.sign({
		id: user._id,
		name: user.name,
		lastname: user.lastname,
		email: user.email
	}, JWT_SECRET as Secret, {
		expiresIn: '7d'
	});
	res.cookie('token', token, {
		httpOnly: true,
		// secure: true, //solo funciona en https
	});
	const { password, _id, roles, ...other } = user;
	return res.status(200).json(
		{
			token,
			id: _id,
			perms: roles.includes('Sponsor') ? { 'CREATE_CAMPAIGNS': 1 } : {},
			...other
		});
}

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

const awsConfig = {
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
	apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		// console.log(email);
		//const { nanoid } = require('nanoid');
		const crypto = require('crypto');
		const nodemailer = require('nodemailer');
		//const { nanoid } = await import('nanoid');
		//const resetToken = nanoid(6).toUpperCase();
		//PREPARAMOS PARA EL EMAIL


		// Generate a unique reset token
		const resetToken = crypto.randomBytes(32).toString('hex');
		const tokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
		const user = await User.findOneAndUpdate(
			{ email },
			{ resetToken, tokenExpiration }
		);
		if (!user) return res.status(404).send(`USER NOT FOUND`);
		// Update user record with reset token and expiration
		//usersDb[email] = { ...user, resetToken, tokenExpiration };
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
								<h2>${resetToken}</h2>
							</html>`,
					},
				},
				Subject: {
					Charset: 'UTF-8',
					Data: 'Password Reset Code',
				},
			},
		};
		// Setup nodemailer transporter for sending emails
		const transporter = nodemailer.createTransport({
			service: 'Gmail', // Use a real service provider in production
			auth: {
				user: 'your-email@gmail.com',
				pass: 'your-email-password',
			},
		});

		// Email content
		const mailOptions = {
			from: 'your-email@gmail.com',
			to: email,
			subject: 'Password Reset Request',
			text: `To reset your password, please click the link below:\n\nhttp://localhost:3000/reset-password/${resetToken}`,
		};

		try {
			// Send the email
			await transporter.sendMail(mailOptions);
			res.status(200).json({ message: 'Password reset email sent' });
		} catch (error) {
			// Handle email sending errors
			res.status(500).json({ message: 'Error sending email', error });
		}

		/*
		SES.sendEmail(params as SendEmailRequest, (err, data) => {
			if (err) {
				console.log(err);
				return res.json({ ok: false });
			} else {
				console.log(data);
				return res.json({ ok: true });
			}
		});*/
	} catch (error) {
		console.log(error);
		res.status(500).send({ error });
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
