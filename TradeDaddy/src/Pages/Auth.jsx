import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [msg, setMsg] = useState("");

  const handleAuth = async () => {
    setMsg("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Signup successful! Check email to verify.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const token = data.session.access_token;
        localStorage.setItem("token", token);

        // test flask endpoint
        const res = await fetch("http://localhost:5000/api/check", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMsg(await res.text());
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div style={{ width: 300, margin: "auto", padding: 20 }}>
      <h3>{mode === "login" ? "Login" : "Signup"}</h3>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} /><br/>
      <input placeholder="password" type="password" onChange={e => setPassword(e.target.value)} /><br/>
      <button onClick={handleAuth}>
        {mode === "login" ? "Login" : "Create Account"}
      </button>
      <p style={{ color: "gray" }}>{msg}</p>

      <button onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        Switch to {mode === "login" ? "Signup" : "Login"}
      </button>
    </div>
  );
}
