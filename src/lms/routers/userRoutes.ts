import { sendError } from "../../utils/responses";

const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");
const Profile = require("../models/ProfileSchema");
const jwt = require("jsonwebtoken");
const JWT_SECRET_TOKEN = process.env.JWT_SECRET;
const auth = require("../middelware/auth");

router.get("/", auth, async (req: any, res: any) => {
	try {
		const user = await Profile.findOne({ user: res.authToken.id });
		res.json(user);
	} catch (e) {
		sendError(res)(e);
	}
});

router.post("/signup", async (req: any, res: any) => {
	try {
		const { uid, displayName, email, avatar } = req.body;
		const user = await Profile.findOne({ email: req.body.email });
		if (user) {
			res.json({ error: "User Already Exists" });
		}
		const newUser = new User({
			uid,
			displayName,
			email,
			membership: "student",
		});
		const createProfile = new Profile({
			user: uid,
			displayName,
			email,
			avatar,
			membership: "student",
		});
		await newUser.save();
		await createProfile.save();
		const payload = {
			id: req.body.uid,
		};
		jwt.sign(
			payload,
			JWT_SECRET_TOKEN,
			{ expiresIn: 35000000000000000 },
			(err: any, token: any) => {
				if (err) {
					res.json({ msg: err });
				} else {
					res.json({ token });
				}
			}
		);
	} catch (e) {
		return sendError(res)(e);
	}
});

// Sing IN
router.post("/signin", async (req: any, res: any) => {
	try {
		// IF USER ALREADY EXISTS
		let userData = await User.findOne({ email: req.body.email });
		if (!userData) {
			return res.json({ errors: "Please Register Before Login" });
		}
		// VERIFY USER
		if (userData.uid !== req.body.uid) {
			return res.json({ errors: "Invalid User" });
		}
		//JWT RETURN
		const payload = {
			id: userData.uid,
		};
		jwt.sign(payload, JWT_SECRET_TOKEN, { expiresIn: 3600 }, (err: any, token: string) => {
			if (err) {
				res.json({ msg: err });
			} else {
				res.json({ token });
			}
		});
	} catch (e) {
		sendError(res)(e);
	}
});

//authwithgoogle
router.post("/authwithgoogle", async (req: any, res: any) => {
	const { uid, displayName, email, avatar } = req.body;
	try {
		//Get user and profile schema
		const user = await User.findOne({ uid });
		const profile = await Profile.findOne({ user: uid });
		//Check
		if (!user) {
			if (uid && displayName && email) {
				const newUser = new User({
					uid,
					displayName,
					email,
					membership: "student",
				});
				const createProfile = new Profile({
					user: uid,
					displayName,
					email,
					avatar,
					membership: "student",
				});
				await newUser.save();
				await createProfile.save();
				const payload = {
					id: req.body.uid,
				};
				jwt.sign(
					payload,
					JWT_SECRET_TOKEN,
					{ expiresIn: 3500 },
					(err: any, token: string) => {
						if (err) {
							res.json({ errors: err.message });
						} else {
							res.json({ token });
						}
					}
				);
			}
		} else {
			// IF USER ALREADY EXISTS
			let userData = await User.findOne({ email: req.body.email });
			if (userData) {
				// VERIFY USER
				if (userData.uid !== req.body.uid) {
					return res.json({ errors: "Invalid User" });
				}
				//JWT RETURN
				const payload = {
					id: userData.uid,
				};
				jwt.sign(
					payload,
					JWT_SECRET_TOKEN,
					{ expiresIn: 3600 },
					(err: any, token: string) => {
						if (err) {
							res.json({ msg: err });
						} else {
							res.json({ token });
						}
					}
				);
			}
		}
	} catch (e) {
		res.status(500).send("SERVER ERROR!");
	}
});

module.exports = router;
