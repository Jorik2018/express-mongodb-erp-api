import { Request, Response, NextFunction } from 'express'

module.exports = function (req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    jwt.verify(token, config.get('jwtSecret'), (error: Error, decoded: { user: string }) => {
      if (error) {
        return res.status(401).json({ msg: 'Token is not valid' });
      } else {
        (req as unknown as {user:string}).user = decoded.user;
        next();
      }
    });
  } catch (err:any) {
    console.error('something wrong with auth middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
};
