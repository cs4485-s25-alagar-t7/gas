export const login = (req, res) => {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password are required' 
        });
    }

    if (username === 'admin' && password === 'gasadmin') {
        req.session.isAuthenticated = true;
        req.session.user = { username };
        console.log('Login successful for user:', username);
        return res.json({ 
            success: true, 
            message: 'Login successful',
            user: { username } 
        });
    } else {
        console.log('Login failed for user:', username);
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
};

export const logout = (req, res) => {
    console.log('Logout request for session:', req.session.id);
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error during logout' 
                });
            }
            res.clearCookie('connect.sid');
            return res.json({ 
                success: true, 
                message: 'Logged out successfully' 
            });
        });
    } else {
        return res.json({ 
            success: true, 
            message: 'Already logged out' 
        });
    }
};

export const checkAuth = (req, res) => {
    console.log('Check auth session:', req.session);
    const isAuthenticated = !!req.session.isAuthenticated;
    console.log('Is authenticated:', isAuthenticated);
    return res.json({ 
        isAuthenticated,
        user: req.session.user || null 
    });
}; 