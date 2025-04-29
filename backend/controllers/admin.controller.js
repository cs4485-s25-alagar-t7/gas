export const login = (req, res) => {
    const { username, password } = req.body;
  
    // Hardcoded for now
    if (username === 'admin' && password === 'gasadmin') {
      return res.status(200).json({ message: 'Login successful'});
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  };
  