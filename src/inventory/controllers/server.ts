import { sendError } from "../../utils/errors";
import { Request, Router, Response } from 'express';

const mysql = require('mysql');
const {
  log,
  ExpressAPILogMiddleware
} = require('@rama41222/node-logger');

let connection = mysql.createConnection({
  host: 'backend-db',
  port: '3306',
  user: 'manager',
  password: 'Password',
  database: 'db'
});

const config = {
  name: 'sample-express-app',
  port: 8000,
  host: '0.0.0.0',
};

const router = Router();

const logger = log({
  console: true,
  file: false,
  label: config.name
});
router.use(ExpressAPILogMiddleware(logger, {
  request: true
}));

//Attempting to connect to the database.
connection.connect(function (err: any) {
  if (err)
    logger.error("Cannot connect to DB!");
  logger.info("Connected to the DB!");
});

router.get('/users', (req: any, res: any) => {
  connection.query('SELECT * FROM db.users', (err: any, data: any) => {
    if (err) {
      sendError(res)(err)
    } else {
      res.status(200).json({ data });
    }
  });
});

router.get('/users/:user_id', (req: any, res: any) => {
  connection.query('SELECT * FROM db.users WHERE db.users.user_id = ?', [req.params.user_id], (err: any, data: any[]) => {
    if (err) {
      sendError(res)(err)
    } else {
      res.status(200).json({ data });
    }
  });
});

router.post('/users', (req: any, res: any) => {
  console.log(req.body);

  let values_string = 'type, dept_id, email, password, first, last';
  let values = [req.body.type, req.body.dept_id, req.body.email, req.body.password, req.body.first, req.body.last]

  connection.query(`INSERT INTO db.users (${values_string}) VALUES(?, ?, ?, ?, ?, ?)`, values, (err: any) => {
    if (err) {
      sendError(res)(err)
    } else {
      res.status(200).send(`added to the table!`);
    }
  });
});

router.put('/users/:user_id', (req: any, res: any) => {
  let values = [req.body.type, req.body.dept_id, req.body.email, req.body.password, req.body.first, req.body.last, req.params.user_id];
  connection.query(`
      UPDATE db.users 
      SET 
        db.users.type = ?, 
        db.users.dept_id = ?, 
        db.users.email = ?, 
        db.users.password = ?, 
        db.users.first = ?, 
        db.users.last = ? 
        WHERE db.users.user_id = ?
      `, values, (err: any, rows: any[]) => {
    if (err) {
      sendError(res)(err)
    } else {
      res.status(200).json({
        "data": rows
      });
    }
  });
});

router.delete('/users/:user_id', (req: any, res: any) => {
  connection.query('DELETE FROM db.users WHERE db.users.user_id = ?', [req.params.user_id], (err: any, rows: any[]) => {
    if (err) {
      sendError(res)(err)
    } else {
      res.status(200).json({
        "data": rows
      });
    }
  });
});

router.post('/login', (req: Request, res: any) => {
  connection.query(`
      SELECT 
        CASE 
          WHEN EXISTS (
            SELECT * 
            FROM db.users 
            WHERE db.users.email = ? AND db.users.password = ?) 
          THEN 1
          ELSE 0
        END as Valid
          `, [req.body.email, req.body.password], (err: any, data: any[]) => {
    if (err) {
      sendError(res)(err)
    } else {
      res.status(200).json({ data });
    }
  });
});

router.get('/users/department/:dept_id', (req: any, res: any) => {
  console.log(req.body);

  connection.query(`
      SELECT db.users.* 
      FROM db.users 
      INNER JOIN db.departments 
        ON db.users.dept_id = db.departments.dept_id 
      WHERE db.departments.dept_id = ?
      `, [req.params.dept_id], (err: any, data: any[]) => {
    if (err) {
      sendError(res)(err)
    } else {
      res.status(200).json({ data });
    }
  });
});
