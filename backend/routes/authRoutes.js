import express from 'express';
const router = express.Router();

// Handle CORS preflight requests
router.options('*', (req, res) => {
    res.sendStatus(200);
});

router.post('/login', (req, res) => {
    console.log('Received login request');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    
    if (username === 'admin' && password === 'gasadmin') {
        req.session.isAuthenticated = true;
        req.session.user = { username };
        console.log('Login successful');
        console.log('Session:', req.session);
        res.json({ 
            success: true,
            message: 'Login successful',
            user: { username }
        });
    } else {
        console.log('Login failed - Invalid credentials');
        console.log('Received:', { username, password });
        res.status(401).json({ 
            success: false,
            message: 'Invalid credentials'
        });
    }
});

router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error during logout'
                });
            }
            res.clearCookie('connect.sid', {
                path: '/',
                domain: 'localhost',
                httpOnly: true,
                secure: false,
                sameSite: 'none'
            });
            res.json({ 
                success: true,
                message: 'Logged out successfully'
            });
        });
    } else {
        res.json({ 
            success: true,
            message: 'Already logged out'
        });
    }
});

router.get('/check-auth', (req, res) => {
    // Always return a 200 response, just with different auth status
    res.json({ 
        isAuthenticated: !!req.session.isAuthenticated,
        user: req.session.user || null
    });
});

export default router; 