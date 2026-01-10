import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import MainLayout from "../components/layout/MainLayout";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Auth() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Animate Modal Entry
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);
if (query.get("reset") === "success") {
  setMsg("Password updated successfully! Please log in.");
}

  // Detect signup success
  useEffect(() => {
    if (query.get("signup") === "success") {
      setMsg("Signup successful! Check your email to verify before logging in.");
    }
  }, [query]);

  const handleAuth = async () => {
    setMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        navigate("/auth?signup=success", { replace: true });

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const token = data.session.access_token;
        localStorage.setItem("token", token);

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/check`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return setMsg("Login OK, but backend rejected token.");

        setMsg("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 700);
      }
    } catch (err) {
      setMsg(err.message);
    }

    setLoading(false);
  };

  const handleReset = async () => {
    if (!email) return setMsg("Enter email first.");
    setMsg("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`
    });

    if (error) setMsg(error.message);
    else setMsg("Password reset link sent! Check your email.");

    setLoading(false);
  };

  return (
    <MainLayout>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
          paddingBottom: 60,
          color: "#fff"
        }}
      >
        <div
          style={{
            width: 380,
            padding: "32px 36px",
            borderRadius: "18px",
            background: "rgba(20,20,35,0.65)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 0 32px rgba(82,39,255,0.25)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.92)",
            transition: "opacity .45s ease, transform .45s cubic-bezier(.16,.84,.44,1)"
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h2>

          {mode === "signup" && (
            <p style={{ opacity: 0.75, fontSize: 14 }}>
              We will send you a verification email after signup.
            </p>
          )}

          <input
            placeholder="Email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              fontSize: 15
            }}
          />

          <input
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              fontSize: 15
            }}
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              background: "#5227FF",
              borderRadius: 10,
              border: "none",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity .25s",
              marginTop: 6
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
          </button>

          {mode === "login" && (
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                marginTop: 4,
                background: "transparent",
                border: "none",
                color: "#B8B8FF",
                cursor: "pointer",
                fontSize: 13
              }}
            >
              Forgot password?
            </button>
          )}

          {msg && (
            <p style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>{msg}</p>
          )}

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            disabled={loading}
            style={{
              marginTop: 8,
              background: "transparent",
              border: "none",
              color: "#b8b8ff",
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
