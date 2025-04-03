const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../helpers/errorsHelper");

const authMiddleware = (req, _res, next) => {
  const { authorization } = req.headers;
  const { JWT_SECRET } = require('../config').default;
  jwt.verify(authorization, JWT_SECRET, (err, decoded) => {
    if (err && err.message === "jwt expired") {
      next(new ErrorHandler(401, "Session expired"));
    } else if (err) {
      next(new ErrorHandler(401, "Unauthorized"));
    } else {
      next();
    }
  });
};

export default authMiddleware;
