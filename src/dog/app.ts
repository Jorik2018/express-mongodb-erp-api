import express, { Application, Request, Response } from 'express';
let routes = require('./routes');
let path = require('path');

let app = express();

let logger = require('morgan');
let methodOverride = require('method-override');
let session = require('express-session');
let bodyParser = require('body-parser');
let multer = require('multer');
let errorHandler = require('errorhandler');

// MongoClient
let MongoClient = require('mongodb').MongoClient;
// Database
let db;

// setup mongo connection
MongoClient.connect('mongodb://127.0.0.1:27017/myMongoDB', (err, database) => {
	if (err:any) {
		throw err;
	}
	else {
		db = database;
		console.log("Connected to db!");
	}
});

// make our db accessible to our router
app.use((req:any, _res, next) => {
	req.db = db;
	next();
});

// all environments
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: 'uwotm8'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
}

// routes
app.get('/', routes.homeDog);
app.get('/dog/:name', routes.findByName);
app.post('/create', routes.createDog);
app.post('/update', routes.updateDog);
app.post('/delete', routes.deleteDog);

app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
