import { ObjectId } from 'mongodb';

const list = (req: any, res: any) => {
	let db = req.db;
	let collection = db.collection('dogs');
	collection.find().toArray((err: any, dogsArray: any) => {
		if (dogsArray) {
			res.render('index', {
				title: 'Dogs',
				path: req.path,
				dogs: dogsArray
			});
		}
		else {
			res.render('index', {
				title: 'No Dogs Found'
			});
		}
	});
};

// get one dog
const find = (req: any, res: any) => {
	let db = req.db;
	let collection = db.collection('dogs');
	let name = req.params.name;
	collection.findOne({
		'name': name
	}, (err: any, item: any) => {
		if (item) {
			res.render('dog', {
				title: item.name,
				dog: item
			});
		}
		else {
			res.render('error', {
				message: 'Not Found'
			});
		}
	});
};

// create a new dog
const create = (req: any, res: any) => {
	let db = req.db;
	let collection = db.collection('dogs');
	let post = req.body;
	collection.insert(post, {
		safe: true
	}, (error: any, result: any) => {
		if (error) {
			res.render('error', {
				message: 'Dog Save Failed!'
			});
		}
		else {
			res.redirect("/");
		}
	});
};

// update a dog
const update = (req: any, res: any) => {
	let db = req.db;
	let collection = db.collection('dogs');
	let id = req.body._id;
	let post = req.body;

	let dname = req.body.name;
	let dbreed = req.body.breed;
	let dcolour = req.body.colour;

	let checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	if (id.match(checkForHexRegExp)) {
		let objectId = ObjectId.createFromHexString(id);
		collection.update({
			'_id': objectId
		}, {
			$set: {
				name: dname,
				breed: dbreed,
				colour: dcolour
			}
		}, {
			safe: true
		}, (err: any, item: any) => {
			if (err) {
				res.render('error', {
					message: 'Dog Update Failed! ' + err
				});
			}
			else {
				res.redirect("/");
			}
		});
	}
	else {
		res.render('error', {
			message: 'Invalid Value'
		});
	}
};

const destroy = (req: any, res: any) => {
	let db = req.db;
	let collection = db.collection('dogs');
	let _id = req.body._id;
	let checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	if (_id.match(checkForHexRegExp)) {
		let objectId = ObjectId.createFromHexString(_id);
		collection.remove({
			'_id': objectId
		}, {
			safe: true
		}, function (error: any, result: any) {
			if (error) {
				res.render('error', {
					message: 'Dog Delete failed!'
				});
			}
			else {
				res.redirect("/");
			}
		});
	}
	else {
		res.render('error', {
			message: 'Invalid _id'
		});
	}
};

export default { list, destroy, update, create, find }