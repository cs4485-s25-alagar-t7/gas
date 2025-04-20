import React, { useState } from 'react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setMsg(data.message);

      if (response.ok) {
        sessionStorage.setItem("adminLoggedIn", "true");
        console.log('✅ Login success');
        window.location.href = "/";
      } else {
        console.log('❌ Login failed');
      }
    } catch (err) {
      setMsg('Server error');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit">Login</button>
        </div>
        <p>{msg}</p>
      </form>
    </div>
  );
};

export default AdminLogin;
