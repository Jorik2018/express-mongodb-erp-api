import { Request, Response, Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import { sendError } from '../../utils/responses';

const { ErrorHandler } = require("../helpers/errorsHelper");

export default ({ getUserByEmail }: any) => {

  const router = Router();

  router.post("/login", (req: Request, res: Response, next: any) => {
    const { email, password } = req.body;
    if (!email || !password) {
      next(new ErrorHandler(400, "Missing field(s)"));
    } else {
      getUserByEmail(email)
        .then((result: any) => {
          if (!result.length)
            throw new ErrorHandler(401, "Invalid password or email address");
          const hashedPassword = result[0].password;
          const isValid = bcrypt.compareSync(password, hashedPassword);
          if (!isValid)
            throw new ErrorHandler(401, "Invalid password or email address");
          const token = jwt.sign(
            {
              data: result[0].id,
            },
            process.env.JWT_KEY!,
            { expiresIn: "24h" }
          );
          res.json({ token });
        })
        .catch(sendError(next));
    }
  });

  return router;

};
