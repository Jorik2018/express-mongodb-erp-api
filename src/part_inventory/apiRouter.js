import 'dotenv-flow/config';
import { Router } from 'express';
import Gitrows from 'gitrows';
import request from 'request';
import cuid from 'cuid';
import date from 'date-and-time';

const apiRouter = Router();

const userParts = (id) => process.env.DB_PATH + id + '/parts.json';

const gitrows = new Gitrows({
    user: 'vlrmprjct',
    author: {
        name: 'pia app',
        email: 'pia@app',
    },
    message: 'part created or updated',
    token: process.env.GITHUB_ACCESS,
    strict: false,
});


const defaultRoute = (req, res, next) => {
    console.log('SESSION: ', req.session);
    console.log('TOKEN:', req.session.token);
    console.log('AUTH:', req.isAuthenticated());
    console.log('----');
    if (!req.session.token || req.session.token === '') {
        res.status(401).send({
            'status': 'unauthorized',
            'message': 'authentication is required',
        });
    } else {
        next();
    }
};

apiRouter.get("/*", defaultRoute);

apiRouter.get('/success', (req:any, res:any) => {
    res.status(200).send({
        'status': 'authorized',
        'message': 'user is authenticated',
        'token': req.session.token,
        'user': req.session.passport.user,
    });
});

apiRouter.get('/getuser', (req:any, res:any) => {
    request({
        method: 'get',
        uri: `https://api.github.com/user`,
        headers: {
            Authorization: 'token ' + req.session.token,
            'User-Agent': req.headers['user-agent'],
        }
    }).pipe(res);
});

apiRouter.get('/oemsecret/:query?', (req:any, res:any) => {
    request({
        uri: 'https://beta.api.oemsecrets.com/partsearch',
        qs: {
            apiKey: process.env.OEMSECRET_API_KEY,
            // currency: 'EUR',
            // countryCode: 'DE',
            // groupBy: 'distributor_name',
            searchTerm: req.params.query
        }
    }).pipe(res);
});

apiRouter.get('/mouser/:query?', (req:any, res:any) => {
    request({
        uri: 'https://api.mouser.com/api/v1.0/search/keyword',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "SearchByKeywordRequest": {
                "keyword": req.params.query,
                "records": 0,
                "startingRecord": 0,
                // "searchOptions": "string",
                // "searchWithYourSignUpLanguage": "string"
            }
        }),
        qs: {
            apikey: process.env.MOUSER_API_KEY
        }
    }).pipe(res);
});

apiRouter.get('/parts', (req:any, res:any) => {
    gitrows.get(userParts(req.userID))
        .then((data) => {
            res.status(200).send(data && data.reverse());
        });
});

apiRouter.get('/partcolumns', (req:any, res:any) => {
    gitrows.get(process.env.DB_PATH + 'structure.json')
        .then((data) => {
            res.status(200).send(data);
        });
});

apiRouter.post('/delete', (req:any, res:any) => {
    gitrows.delete(userParts(req.userID), req.body,  { id: req.body.id })
        .then((response) => {
            res.status(200).send({ ...response, ...{ id: req.body.id }});
        });
});

apiRouter.post('/part', (req:any, res:any) => {

    const now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

    const data = {
        ...req.body,
        ...{
            'date_updated': now,
        }
    };

    gitrows.update(userParts(req.userID), data, { id: req.body.id })
        .then((response) => {
            res.status(response.code).send(response);
        });
});

apiRouter.get('/parts/:id?', (req:any, res:any) => {
    gitrows.get(userParts(req.userID), { id: req.params.id })
        .then((data) => {
            res.status(200).send(data);
        });
});

apiRouter.post('/addpart', (req:any, res:any) => {

    const now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

    const data = {
        ...req.body,
        ...{
            'id': cuid(),
            'date_created': now,
            'date_updated': now,
        }
    };

    gitrows.put(userParts(req.userID), data)
        .then((response) => {
            res.status(response.code).send({ response, data });
        });
});

apiRouter.get('/latestentries', (req:any, res:any) => {
    gitrows.get(userParts(req.userID))
        .then((data) => {
            res.status(200).send(data && data.slice(-5).reverse());
        });
});

export default apiRouter;
