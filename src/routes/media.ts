import { Router, Response } from 'express';
import { RequestWithUserId } from '../auth/is-auth';
import Contact from '../database/models/contact';
import { sendError } from '../utils/responses';
import { Types } from 'mongoose';
import axios from 'axios';

const get_media = ({ params: { provider }, userId }: RequestWithUserId, res: Response) => {
    const user = Types.ObjectId.createFromHexString(userId);
    return Contact.findOne({ user }).lean()
        .then(({ socials }: any) => {
            if (!socials) throw 'User no binding to social provider';
            const { access_token, id } = socials[provider];

            if (provider == 'instagram') {

                return axios.get(`https://graph.instagram.com/v22.0/${id}/media`, {
                    params: {
                        access_token,
                        fields: 'id,ig_id,media_product_type,media_type,media_url,thumbnail_url,timestamp,like_count'
                    }
                })
                    .then(({ data }) => data)
                    .then((data) => {
                        res.status(200).json(data)
                    })
            } else if (provider == 'tiktok') {
                axios.post(`https://open.tiktokapis.com/v2/video/list/`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        fields: 'cover_image_url,id,title'
                    }
                })
                    .then(({ data }) => data)
                    .then((data) => {
                        res.status(200).json(data)
                    })
            }
        })
        .catch(sendError(res));
}

const router = Router();

router.get("/:provider", get_media as any);

export default router;
