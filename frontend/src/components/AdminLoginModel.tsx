import { useState } from "react";

interface Props {
  onLogin: () => void;
}

const AdminLoginModal = ({ onLogin }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    console.log("Attempting login with:", username, password);

    const response = await fetch("http://localhost:5001/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      sessionStorage.setItem("adminLoggedIn", "true");
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Enter key detected");
      handleLogin();
    }
  };

  return (
    <div style={modalStyle}>
      <form style={formStyle} onSubmit={handleLogin}>
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          onKeyDown={handleKeyDown}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onKeyDown={handleKeyDown}
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </div>
  );
};

export default AdminLoginModal;

const modalStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const formStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "2rem",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  minWidth: "300px",
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem",
  fontSize: "1rem",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.5rem",
  fontSize: "1rem",
  cursor: "pointer",
};
