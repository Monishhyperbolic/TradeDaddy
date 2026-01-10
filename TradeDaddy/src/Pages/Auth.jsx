import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Auth() {
  const navigate = useNavigate();
  
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

        setMsg("Signup successful! Please verify your email.");
        
        // optional redirect
        setTimeout(() => navigate("/auth?signup=success"), 800);

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const token = data.session.access_token;
        localStorage.setItem("token", token);

        // verify with backend
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/check`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          setMsg("Login OK, but backend rejected token.");
        } else {
          setMsg("Login successful! Redirecting...");
          // redirect to dashboard
          setTimeout(() => navigate("/dashboard"), 800);
        }
      }

    } catch (err) {
      setMsg(err.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div style={{ width: 320, margin: "80px auto", padding: 20, color: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        {mode === "login" ? "Login" : "Create Account"}
      </h2>

      <input
        placeholder="Email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          marginBottom: 10,
          padding: 8,
          borderRadius: 6,
          border: "1px solid #333",
          background: "#1c1c1c",
          color: "#fff"
        }}
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          marginBottom: 10,
          padding: 8,
          borderRadius: 6,
          border: "1px solid #333",
          background: "#1c1c1c",
          color: "#fff"
        }}
      />

      <button
        onClick={handleAuth}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          background: "#5227FF",
          border: "none",
          borderRadius: 6,
          color: "#fff",
          cursor: "pointer",
          marginTop: 10
        }}
      >
        {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
      </button>

      {msg && <p style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>{msg}</p>}

      <button
        style={{
          width: "100%",
          padding: 10,
          background: "transparent",
          border: "none",
          color: "#aaa",
          cursor: "pointer",
          marginTop: 12
        }}
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        disabled={loading}
      >
        {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Login"}
      </button>
    </div>
  );
}
