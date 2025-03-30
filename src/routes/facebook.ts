import axios from 'axios';
import { Router } from 'express';
import generatePKCE from '../utils/pkce'
const router = Router();

const {
    FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI,
    TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI
} = process.env;

// Initiates the Facebook Login flow
router.get('/facebook', (req, res) => {
    res.cookie('provider', 'facebook', { maxAge: 60000 });
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=email`;
    res.redirect(url);
});

router.get("/tiktok", (req, res) => {
    res.cookie('provider', 'tiktok', { maxAge: 60000 });
    const csrfState = Math.random().toString(36).substring(2);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });
    const { codeVerifier, codeChallenge } = generatePKCE();
    res.cookie('verifier', codeVerifier, { maxAge: 60000 });
    let url = 'https://www.tiktok.com/v2/auth/authorize';
    url += `?client_key=${TIKTOK_CLIENT_KEY}`;
    url += '&scope=user.info.basic,video.list';
    url += '&response_type=code';
    url += `&redirect_uri=${TIKTOK_REDIRECT_URI}`;
    url += `&state=${csrfState}`;
    url += `&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    res.redirect(url);
});
//router.get('/tiktok', (req, res) => {
//  const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${TIKTOK_APP_ID}&redirect_uri=${TIKTOK_REDIRECT_URI}&scope=email`;
//  res.redirect(url);
//});
router.post('/put', (req, res) => {
    res.cookie('value', req.body.name, { maxAge: 60000, httpOnly: true });
    res.send({ ok: true })
})
router.post('/get', (req, res) => {
    const { body } = req;
    console.log(req.cookies);
    res.send({ ok: true })
})
router.post('/token', async ({ body: { code, provider }, cookies }, res) => {
    // Mock successful social login
    /*const mockUser: User = {
      id: '2',
      lastname:'',
      name: provider === 'facebook' ? 'Facebook User' : 'TikTok User',
      email: `${provider}user@example.com`,
      profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
      followers: provider === 'tiktok' ? 5600 : 890,
      preferences: [],
      isAdvertiser: false // Default as influencer
    };*/
    try {
        //facebook
        /**
         * email: "ea_pinedo@yahoo.es"
         * id: "1650937281635586"
name: "Erik Alarcón Pinedo" 
*/
        console.log(code, provider, cookies)
        if (cookies) provider = cookies.provider || provider
        console.log('provider=', provider)
        if (provider == 'tiktok') {
            const codeVerifier = cookies.verifier;
            const params = new URLSearchParams();
            params.append('client_key', TIKTOK_CLIENT_KEY!);
            params.append('client_secret', TIKTOK_CLIENT_SECRET!);
            params.append('code', code);
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', TIKTOK_REDIRECT_URI!);
            params.append('code_verifier', codeVerifier);
            const data = await axios.post(`https://open.tiktokapis.com/v2/oauth/token/`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            console.log(data)
            res.send(data.data || data);
        } else {
            const { data } = await axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${FACEBOOK_REDIRECT_URI}`);
            const { access_token } = data;
            // Use access_token to fetch user profile
            const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);

            res.send(profile);
        }
    } catch (error: any) {
        console.error('Error-token:', error.response);
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

// Logout route
router.get('/logout', (req, res) => {
    // Code to handle user logout
    res.redirect('/login');
});

export default router;
