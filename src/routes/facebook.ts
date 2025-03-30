import axios from 'axios';
import { Router } from 'express';

const router = Router();

const { FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI } = process.env;

// Initiates the Facebook Login flow
router.get('/facebook', (req, res) => {
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=email`;
    res.redirect(url);
});

router.get('/tiktok', (req, res) => {
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${TIKTOK_APP_ID}&redirect_uri=${TIKTOK_REDIRECT_URI}&scope=email`;
    res.redirect(url);
});

router.post('/token', async ({ body: { code, provider } }, res) => {
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
        console.log(code, provider)
        const { data } = await axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${FACEBOOK_REDIRECT_URI}`);
        const { access_token } = data;
        // Use access_token to fetch user profile
        const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);
        
        res.send(profile);
    } catch (error: any) {
        console.error('Error:', error.response.data.error);
        //res.redirect('/login');
    }
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // Exchange authorization code for access token
        const { data } = await axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&code=${code}&redirect_uri=${FB_REDIRECT_URI}`);

        const { access_token } = data;

        // Use access_token to fetch user profile
        const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);

        // Code to handle user authentication and retrieval using the profile data

        //res.redirect('/');
    } catch (error: any) {
        console.error('Error:', error.response.data.error);
        //res.redirect('/login');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    // Code to handle user logout
    res.redirect('/login');
});

export default router;
