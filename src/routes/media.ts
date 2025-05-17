import { Router, Response } from 'express';
import { RequestWithUserId } from '../auth/is-auth';
import Contact from '../database/models/contact';
import { sendError } from '../utils/responses';
import { Types } from 'mongoose';
import axios from 'axios';

const get_media = ({ params: { provider }, userId }: RequestWithUserId, res: Response) => {
    //userId = '6827bc7e152604e6928c1e6a'
    //provider = 'tiktok'
    const user = Types.ObjectId.createFromHexString(userId);
    return Contact.findOne({ user }).lean()
        .then(({ socials }: any) => {
            if (!socials) throw 'User no binding to social provider';
            const { access_token, id } = socials[provider];
            if (provider == 'instagram') {
                return axios.get(`https://graph.instagram.com/v22.0/${id}/media`, {
                    params: {
                        access_token,
                        fields: 'id, ig_id, media_product_type, media_type, media_url, thumbnail_url, timestamp, like_count'
                    }
                }).then(({ data }) => data)
            } else if (provider == 'tiktok') {
                return axios.post(`https://open.tiktokapis.com/v2/video/list/?fields=cover_image_url, id, title`, {}, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json',
                    }
                }).then(({ data }) => {
                    const videos = data.data.videos;
                    data.data = videos.map(({ cover_image_url:thumbnail_url, id, title }:any) => ({
                        thumbnail_url,id,media_type:'VIDEO',title
                    }));
                    return data;
                })
            } else {
                return Promise.resolve({})
            }
        })
        .catch(sendError(res))
        .then((data) => {
            res.status(200).json(data)
        });
}

const router = Router();

router.get("/:provider", get_media as any);

export default router;
