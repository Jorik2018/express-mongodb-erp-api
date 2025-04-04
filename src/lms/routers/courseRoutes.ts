import express, { Application, Request, Response } from 'express';
const router = express.Router();
const auth = require("../middelware/auth");
const Course = require("../models/CourseSchema");
const User = require("../models/UserSchema");
const Profile = require("../models/ProfileSchema");

router.get("/", async (req: Request, res: Response) => {
	Course.find().then((courses:any) => res.json(courses))
		.catcH((error: Error) => console.log(error.message));
});

//Created new course
router.post("/", auth, async (req:any, res:any) => {
	const { title, thumbnail, price, author, description } = req.body;
	try {
		const user = await User.findOne({ uid: res.authToken.id });
		if (user.membership === "student") {
			res.json({
				errors: "You don't create Courses",
			});
		}
		const course = new Course({
			title,
			thumbnail,
			price,
			author,
			description,
		});
		await course.save();
		res.json(course);
	} catch (e:any) {
		return res.status(404).json({ msg: e.message });
	}
});

// Create module
router.put("/module/:courseId", auth, async (req:any, res:any) => {
	const { moduleNo, moduleTitle } = req.body;
	try {
		//Get course by id
		const course = await Course.findById(req.params.courseId);
		//Create outline object and save into database
		const newModule = {
			moduleNo,
			moduleTitle,
		};
		course.outline.push(newModule);
		//Save
		course.save();
		//return course object
		res.json(course);
	} catch (e:any) {
		res.json({ msg: e.message });
	}
});

// Create Lesson
router.put("/lesson/:courseId/:moduleId", auth, async (req:any, res:any) => {
	const {
		lessonNo,
		lessonTitle,
		lessonDesc,
		duration,
		video,
		attachment,
		attachmentLink,
	} = req.body;
	try {
		//Get course schema by id
		const course = await Course.findById(req.params.courseId);
		//Create new lesson in object
		const newCourse = {
			lessonNo,
			moduleNo: req.params.moduleId,
			lessonTitle,
			lessonDesc,
			duration,
			video,
			status: false,
			download: { attachment, attachmentLink },
		};
		//Figure out module by module id
		const moduleId = course.outline.map((x:any) => x._id);
		const moduleIndx = moduleId.indexOf(req.params.moduleId);
		//Push into course schema lesson array
		course.outline[moduleIndx].lesson.push(newCourse);
		//Save into Database
		course.save();
		//response course object
		res.json(course);
	} catch (e:any) {
		res.json({ msg: e.message });
	}
});

//Add Teacher's note
router.put("/note/:courseId/:moduleId/:lessonId", auth, async (req:any, res:any) => {
	const { referenceTitle, referenceLinks } = req.body;
	try {
		//Get course schema by id
		const course = await Course.findById(req.params.courseId);
		//Create new note in object
		const newNote = {
			referenceTitle,
			referenceLinks,
		};
		//Figure out module by module id
		const moduleId = course.outline.map((x:any) => x._id);
		const moduleIndx = moduleId.indexOf(req.params.moduleId);
		const getModule = course.outline[moduleIndx];
		//Figure out lesson
		const lessonId = getModule.lesson.map((x:any) => x._id);
		const lessonIndx = lessonId.indexOf(req.params.lessonId);
		//Push into course schema lesson array
		getModule.lesson[lessonIndx].teachersNote.push(newNote);
		//Save into Database
		course.save();
		//response course object
		res.json(course);
	} catch (e:any) {
		res.json({ msg: e.message });
	}
});
//momentum
router.put(
	"/momentum/:courseId/:moduleId/:lessonId",
	auth,
	async (req, res:any) => {
		const { moment } = req.body;
		try {
			const getUser = {
				user: res.authToken.id,
			};
			//Get course schema by id
			const course = await Course.findById(req.params.courseId);
			//Figure out module by module id
			const moduleId = course.outline.map((x:any) => x._id);
			const moduleIndx = moduleId.indexOf(req.params.moduleId);
			const getModule = course.outline[moduleIndx];
			//Figure out lesson
			const lessonId = getModule.lesson.map((x:any) => x._id);
			const lessonIndx = lessonId.indexOf(req.params.lessonId);
			// Push into course schema lesson array
			moment === "happy"
				? getModule.lesson[lessonIndx].momentum.happy.push(getUser)
				: "";
			moment === "sad"
				? getModule.lesson[lessonIndx].momentum.sad.push(getUser)
				: "";
			moment === "anger"
				? getModule.lesson[lessonIndx].momentum.anger.push(getUser)
				: "";
			//Save into Database
			course.save();
			// response course object
			res.json(course);
		} catch (e:any) {
			res.json({ msg: e.message });
		}
	}
);

//Lesson done
router.put(
	"/complected/:courseId/:moduleId/:lessonId",
	auth,
	async (req, res:any) => {
		try {
			//Get course schema by id
			const profile = await Profile.findOne({ user: res.authToken.id });

			//Course into enrolled array
			const course = profile.courses.enrolled.find(
				(course:any) => course._id == req.params.courseId
			);
			const module = course.outline.find((x:any) => x._id == req.params.moduleId);
			const lesson = module.lesson.find((x:any) => x._id == req.params.lessonId);
			lesson.status = true;
			// Save into Database
			profile.save();
			// response course object
			res.json(profile);
		} catch (e:any) {
			res.json({ msg: e.message });
		}
	}
);

module.exports = router;
