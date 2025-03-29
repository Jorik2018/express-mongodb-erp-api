import axios from 'axios';
import { Router } from 'express';

const router = Router();

const { FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI } = process.env;

// Initiates the Facebook Login flow
router.get('', (req, res) => {
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${FB_REDIRECT_URI}&scope=email`;
    res.redirect(url);
});

// Callback URL for handling the Facebook Login response
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // Exchange authorization code for access token
        const { data } = await axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&code=${code}&redirect_uri=${FB_REDIRECT_URI}`);

        const { access_token } = data;

        // Use access_token to fetch user profile
        const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);

        // Code to handle user authentication and retrieval using the profile data

        res.redirect('/');
    } catch (error: any) {
        console.error('Error:', error.response.data.error);
        res.redirect('/login');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    // Code to handle user logout
    res.redirect('/login');
});

export default router;
