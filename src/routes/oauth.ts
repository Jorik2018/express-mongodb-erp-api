import axios from 'axios';
import { Router, Response } from 'express';
import generatePKCE from '../utils/pkce'
import { sendError, sendJson } from '../utils/responses';
import Contact from '../database/models/contact';
import Temporal from '../database/models/temporal';
import { generateToken } from '../controllers/auth';
import { Types } from 'mongoose';
import { RequestWithUserId } from '../auth/is-auth';


const {
    FACEBOOK_APP_ID, FACEBOOK_APP_SECRET,
    FACEBOOK_REDIRECT_URI,
    INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET,
    INSTAGRAM_REDIRECT_URI,
    TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI
} = process.env;

export const getSocial = (social: string) => Temporal.findOne({ _id: Types.ObjectId.createFromHexString(social) }).lean().then((temporal: any) => {

    const [socialName, { access_token, refresh_token, ...social }]: any = Object.entries(JSON.parse(temporal.content))[0];
    if (socialName == 'instagram') {
        return axios.get('https://graph.instagram.com/access_token', {
            params: {
                grant_type: 'ig_exchange_token', client_secret: INSTAGRAM_CLIENT_SECRET, access_token
            }
        }).then(({ data }) => {
            return { [socialName]: { ...social, ...data } };
        })
    } else if (socialName == 'tiktok') {
        //debe revisarse si ya ha expirado el token
        const params = new URLSearchParams();
        params.append('client_key', TIKTOK_CLIENT_KEY!);
        params.append('client_secret', TIKTOK_CLIENT_SECRET!);
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refresh_token);
        return axios.post(`https://open.tiktokapis.com/v2/oauth/token/`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(({ data }) => {
            return { [socialName]: { ...social, ...data } };
        })
    } else {
        throw `provider "${socialName}" unknow!`
    }


})

const build = (authMiddleware: any) => {
    const router = Router();
    // Initiates the Facebook Login flow
    router.get('/:provider', ({ params, query: { redirect_uri } }, res) => {
        const provider = params.provider
        res.cookie('provider', provider, { maxAge: 60000 });
        res.redirect(get_oauth_url(res, provider, redirect_uri));
    });

    router.get('/register/:provider', ({ params, query: { redirect_uri } }, res) => {
        const provider = params.provider
        res.cookie('provider', provider, { maxAge: 60000 });
        res.cookie('action', 'register', { maxAge: 60000 });
        res.redirect(get_oauth_url(res, provider, redirect_uri));
    });

    const get_oauth_url = (res: Response, provider: string, redirect_uri?: any) => {
        if (provider == 'facebook') {
            return `https://www.facebook.com/v13.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirect_uri || FACEBOOK_REDIRECT_URI}&scope=email`;
        } else if (provider == 'tiktok') {
            const csrfState = Math.random().toString(36).substring(2);
            res.cookie('csrfState', csrfState, { maxAge: 60000 });
            const { codeVerifier, codeChallenge } = generatePKCE();
            res.cookie('verifier', codeVerifier, { maxAge: 60000 });
            let url = `https://www.tiktok.com/v2/auth/authorize?client_key=${TIKTOK_CLIENT_KEY}`;
            url += '&scope=user.info.basic,user.info.profile,user.info.stats,video.list&response_type=code';
            url += `&redirect_uri=${redirect_uri || TIKTOK_REDIRECT_URI}&state=${csrfState}`;
            url += `&code_challenge=${codeChallenge}&code_challenge_method=S256`;
            return url;
            
        } else if (provider == 'instagram') {
            return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${redirect_uri || INSTAGRAM_REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_insights`;
        }
        throw "No oauth provider"
    }

    router.post('/token', ({ body: { code, provider, action, redirect_uri }, cookies }, res) => {
        try {
            if (cookies) {
                provider = cookies.provider || provider;
                action = cookies.action || action;
            }
            if (provider == 'tiktok') {
                const codeVerifier = cookies.verifier;
                const params = new URLSearchParams();
                params.append('client_key', TIKTOK_CLIENT_KEY!);
                params.append('client_secret', TIKTOK_CLIENT_SECRET!);
                params.append('code', code);
                params.append('grant_type', 'authorization_code');
                params.append('redirect_uri', redirect_uri || TIKTOK_REDIRECT_URI!);
                params.append('code_verifier', codeVerifier);
                axios.post(`https://open.tiktokapis.com/v2/oauth/token/`, params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }).then(({ data: { access_token, expires_in, refresh_token, refresh_expires_in, token_type } }) => axios.get('https://open.tiktokapis.com/v2/user/info/', {
                    /*
                    open_id:
                    scope:
                    access_token:
                    expires_in:
                    refresh_token:
                    refresh_expire_in:
                    token_type:
                    */
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                    params: {
                        fields: 'open_id,union_id,display_name,avatar_url,username,follower_count,bio_description',
                    },
                }).then(({ data: { data: { user: data }, error: { code } } }) => {
                    /*
                    display_name:
                    open_id:user id en app
                    union_id:user id global
                    follower_count:
                    likes_count: 
                    video_count:
                    username:
                    bio_description:
                    */
                    //res.send(user);
                    if (action == 'register') {
                        //tiene q verificarse si existe el socialnet con el id para evitar volver a
                        const { union_id: id, username: name, avatar_url: profileImage, follower_count: followers, video_count: medias } = data;
                        const social = { id, name, profileImage, followers, medias, expires_in, refresh_token, refresh_expires_in, token_type }
                        return new Temporal({ content: JSON.stringify({ tiktok: social }) }).save().then(({ _doc: { _id } }: any) => {
                            res.send({ social: _id, ...social });
                        })
                    } else {
                        const { union_id: user_id } = data;
                        return Contact.findOne({ 'socials.tiktok.id': user_id })
                            .populate('user')
                            .lean()
                            .then((contact) => {
                                if (!contact) {
                                    res.status(404).send({ error: 'Contact not found' });
                                } else {
                                    const { user, ...others } = contact;
                                    generateToken(res, { rating: 0, ...others, ...user })
                                }
                            })
                    }
                })).catch(sendError(res));
            } else if (provider == 'instagram') {
                const formData = new FormData();
                formData.append('client_id', INSTAGRAM_CLIENT_ID!);
                formData.append('client_secret', INSTAGRAM_CLIENT_SECRET!);
                formData.append('grant_type', 'authorization_code');
                formData.append('redirect_uri', redirect_uri || INSTAGRAM_REDIRECT_URI!);
                formData.append('code', code);
                axios.post('https://api.instagram.com/oauth/access_token', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(({ data: { access_token } }) => axios.get('https://graph.instagram.com/v22.0/me', {
                    params: {
                        access_token,
                        fields: 'user_id,username,profile_picture_url,followers_count,media_count'
                    }
                }).then(({ data }) => {
                    if (action == 'register') {
                        //tiene q verificarse si existe el socialnet con el id para evitar volver a
                        const { user_id: id, username: name, profile_picture_url: profileImage, followers_count: followers, media_count: medias } = data;
                        const social = { id, name, profileImage, followers, medias, access_token }
                        return new Temporal({ content: JSON.stringify({ instagram: social }) }).save().then(({ _doc: { _id } }: any) => {
                            res.send({ social: _id, ...social });
                        })
                    } else {
                        const { user_id } = data;
                        return Contact.findOne({ 'socials.instagram.id': user_id })
                            .populate('user')
                            .lean()
                            .then((contact) => {
                                if (!contact) {
                                    res.status(404).send({ error: 'Contact not found' });
                                } else {
                                    const { user, ...others } = contact;
                                    generateToken(res, { rating: 0, ...others, ...user }).then((data) => {
                                        res.status(200).json(data)
                                    })
                                }
                            })

                    }
                })).catch(sendError(res));
            } else if (provider == 'facebook') {
                /*const { data } = await axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${FACEBOOK_REDIRECT_URI}`);
                const { access_token } = data;
                // Use access_token to fetch user profile
                const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);
                res.send(profile);*/
            } else {
                throw "No provider"
            }
        } catch (err: any) {
            sendError(err);
            //res.redirect('/login');
        }
    });

    router.get('/callback', async (req, res) => {
        const { code } = req.query;

        try {
            // Exchange authorization code for access token
            const { data } = await axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${FACEBOOK_REDIRECT_URI}`);

            const { access_token } = data;

            // Use access_token to fetch user profile
            const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);

            // Code to handle user authentication and retrieval using the profile data

            //res.redirect('/');
        } catch (error: any) {
            console.error('Error-callback:', error.response);
            //res.redirect('/login');
        }
    });



    const connect = ({ body: { code, provider, action, redirect_uri }, userId, cookies }: RequestWithUserId, res: Response) => {

        if (cookies) {
            provider = cookies.provider || provider;
            action = cookies.action || action;
        }

        if (provider == 'tiktok') {
            const codeVerifier = cookies.verifier;
            const params = new URLSearchParams();
            params.append('client_key', TIKTOK_CLIENT_KEY!);
            params.append('client_secret', TIKTOK_CLIENT_SECRET!);
            params.append('code', code);
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', redirect_uri || TIKTOK_REDIRECT_URI!);
            params.append('code_verifier', codeVerifier);
            axios.post(`https://open.tiktokapis.com/v2/oauth/token/`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }).then(({ data: { access_token, expires_in, refresh_token, refresh_expires_in, token_type } }) => axios.get('https://open.tiktokapis.com/v2/user/info/', {
                /*
                open_id:
                scope:
                access_token:
                expires_in:
                refresh_token:
                refresh_expire_in:
                token_type:
                */
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                params: {
                    fields: 'open_id,union_id,display_name,avatar_url,username,follower_count,bio_description',
                },
            }).then(({ data: { data: { user: data }, error: { code } } }) => {
                /*
                display_name:
                open_id:user id en app
                union_id:user id global
                follower_count:
                likes_count: 
                video_count:
                username:
                bio_description:
                */
                //res.send(user);
                {
                    const { union_id: user_id } = data;
                    return Contact.findOne({ 'socials.tiktok.id': user_id })
                        .populate('user')
                        .lean()
                        .then((contact) => {
                            if (!contact) {
                                res.status(404).send({ error: 'Contact not found' });
                            } else {
                                const { user, ...others } = contact;
                                generateToken(res, { rating: 0, ...others, ...user })
                            }
                        })
                }
            })).catch(sendError(res));
        } else if (provider == 'instagram') {



            const formData = new FormData();
            formData.append('client_id', INSTAGRAM_CLIENT_ID!);
            formData.append('client_secret', INSTAGRAM_CLIENT_SECRET!);
            formData.append('grant_type', 'authorization_code');
            formData.append('redirect_uri', redirect_uri || INSTAGRAM_REDIRECT_URI!);
            formData.append('code', code);
            axios.post('https://api.instagram.com/oauth/access_token', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(({ data: { access_token } }) => (axios.get('https://graph.instagram.com/v22.0/me', {
                params: {
                    access_token,
                    fields: 'user_id,username,profile_picture_url,followers_count,media_count'
                }
            }).then(({ data }) => ({ ...data, access_token })))).then(({ access_token, ...others }) => (
                axios.get('https://graph.instagram.com/access_token', {
                    params: {
                        grant_type: 'ig_exchange_token', client_secret: INSTAGRAM_CLIENT_SECRET, access_token
                    }
                }).then(({ data }) => ({ ...others, ...data }))

            )).then(({ access_token, user_id: id, username: name, followers_count: followers, media_count: medias }) =>
                Contact.findOne({ 'user': userId })
                    .lean()
                    .then((contact: any) => {
                        if (!contact) {
                            throw 'Contact not found!';
                        }
                        const { socials = {}, _id } = contact;
                        const social = {
                            id,
                            access_token,
                            name,
                            followers,
                            medias,
                            refresh_token: undefined,
                            expires_in: undefined,
                            refresh_expire_in: undefined
                        }
                        socials[provider] = social;
                        contact.socials = socials;
                        return Contact.updateOne({ _id }, { $set: { socials } }).then(() => (
                            { ...social, key:provider }
                        ));
                    })
            )
                .then(sendJson(res))
                .catch(sendError(res));
        }
    };

    router.post('/connect', authMiddleware, connect as any)

    router.get('/logout', (req, res) => {
        // Code to handle user logout
        res.redirect('/login');
    });

    return router;
}
export default build;
