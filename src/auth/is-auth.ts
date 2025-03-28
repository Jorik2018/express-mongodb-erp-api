import jwt from 'jsonwebtoken'
const key = require('../config/default');

const isAuth = (req:any, res:any, next:any) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        const error:any = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(' ')[1];

    let decodedToken:any;

    try {
        decodedToken = jwt.verify(token, key);
    } catch (err:any) {
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken) {
        const error:any = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    next();
};

module.exports = isAuth;