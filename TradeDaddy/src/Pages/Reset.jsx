import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Reset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // modal animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 40);
  }, []);

  const handleReset = async () => {
    setMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMsg("Password successfully updated! Redirecting...");
      setTimeout(() => {
        navigate("/auth?reset=success");
      }, 900);
    } catch (err) {
      setMsg(err.message);
    }

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
          padding: "120px 0",
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
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.92)",
            transition: "opacity .45s ease, transform .45s cubic-bezier(.16,.84,.44,1)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            textAlign: "center"
          }}
        >
          <h2 style={{ fontSize: 26, fontWeight: 700 }}>Reset Password</h2>
          <p style={{ opacity: 0.75, fontSize: 14 }}>
            Enter your new password below.
          </p>

          <input
            type="password"
            placeholder="New Password"
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
            onClick={handleReset}
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              background: "#5227FF",
              border: "none",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity .25s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          {msg && (
            <p style={{ marginTop: 8, fontSize: 14, opacity: 0.9 }}>{msg}</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
