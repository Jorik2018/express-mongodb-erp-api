import jwt from 'jsonwebtoken'

const isAuth = (req: any, res: any, next: any) => {
    //const { authorization } = req.headers;
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error: any = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(' ')[1];

    let decodedToken: any;

    try {
        const { JWT_SECRET } = require('../config').default;
        decodedToken = jwt.verify(token, JWT_SECRET!/*, (err: any, decoded: any) => {
            if (err && err.message === "jwt expired") {
                next(new ErrorHandler(401, "Session expired"));
            } else if (err) {
                next(new ErrorHandler(401, "Unauthorized"));
            } else {
                req.userId = decodedToken.id;
                next();
            }
        }*/);
    } catch (err: any) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error: any = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    if (!req.userId) {
        req.userId = decodedToken.id;
        next();
    }
};

module.exports = isAuth;