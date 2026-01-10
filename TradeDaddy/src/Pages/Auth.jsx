import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); 
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setMsg("");
    setLoading(true);
    
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Signup successful! Check your email to verify.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const token = data.session.access_token;
        localStorage.setItem("token", token);

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/check`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          setMsg("Login successful, but backend rejected token.");
        } else {
          const text = await res.text();
          setMsg(`Backend says: ${text}`);
        }
      }
    } catch (err) {
      setMsg(err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ width: 300, margin: "auto", padding: 20 }}>
      <h3>{mode === "login" ? "Login" : "Signup"}</h3>

      <input 
        placeholder="email" 
        onChange={e => setEmail(e.target.value)} 
        style={{ width: "100%", marginBottom: 8 }}
      />

      <input 
        placeholder="password" 
        type="password" 
        onChange={e => setPassword(e.target.value)} 
        style={{ width: "100%", marginBottom: 8 }}
      />

      <button onClick={handleAuth} disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
      </button>

      <p style={{ color: "gray", marginTop: 10 }}>{msg}</p>

      <button 
        style={{ marginTop: 10 }} 
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        disabled={loading}
      >
        Switch to {mode === "login" ? "Signup" : "Login"}
      </button>
    </div>
  );
}
