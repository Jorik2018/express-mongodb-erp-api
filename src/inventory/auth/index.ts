import axios from "axios";
import { NextFunction, Request, Response } from "express";

async function validateToken(req: Request, res: Response, next: NextFunction){
    req.body.user_id = `1`;
   if(1){next();return};
    
    if(req.headers.authorization!==undefined){
        
  
        let token = req.headers.authorization.split(" ")[1]
        if(token){
            try {
                next();
                /*let url = process.env.OAUTH_URL || '';
                url = url+"/api/me"
                let response = await axios({
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer '+token 
                    }
                })
                if(response.status===200){
                    req.body.user_id = `${response.data.id}`
                    next();
                } else {
                    res.status(400).json({
                        "message": "Something went wrong",
                        "data": null,
                        "error": "Unknow"
                    })
                }*/
            } catch (error: any) {
                res.status(500).json({
                    "message": "Something went wrong",
                    "data": null,
                    "error": error.response.data
                })
            }
        } else {
            res.status(400).json({
                "message": "Something went wrong",
                "data": null,
                "error": "Unknow"
            })
        }
    } else {
        res.status(400).json({
            "message": "token is empty",
            "error": "Unknow"
        })
    }
}


export {
    validateToken
}