import { Application, Router } from 'express';

const build = (app: Application) => {

	const router = Router();

	let methodOverride = require('method-override');

	let session = require('express-session');

	let errorHandler = require('errorhandler');

	const { MongoClient } = require('mongodb');

	let db: any;

	MongoClient.connect('mongodb://127.0.0.1:27017/myMongoDB', (err: any, database: any) => {
		if (err) {
			throw err;
		}
		else {
			db = database;
			console.log("Connected to db!");
		}
	});

	router.use((req: any, _res, next) => {
		req.db = db;
		next();
	});

	router.use(methodOverride());

	router.use(session({
		resave: true,
		saveUninitialized: true,
		secret: 'uwotm8'
	}));

	if ('development' == app.get('env')) {
		router.use(errorHandler());
	}

	let routes = require('../controllers/dog');

	router.get('/', routes.homeDog);
	router.get('/:id', routes.findByName);
	router.post('/', routes.createDog);
	router.put('/', routes.updateDog);
	router.delete('/:id', routes.deleteDog);
}
export default build;