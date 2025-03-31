import jwt from 'jsonwebtoken'

const isAuth = (req: any, res: any, next: any) => {
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
        decodedToken = jwt.verify(token, JWT_SECRET!);
    } catch (err: any) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error: any = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    //console.log('decodedToken', decodedToken)
    req.userId = decodedToken.id;
    next();
};

module.exports = isAuth;