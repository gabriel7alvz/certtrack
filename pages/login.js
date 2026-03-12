import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { USERS, setSession } from "../lib/data";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    const user = USERS.find((u) => u.email === email.trim() && u.password === password.trim());
    if (!user) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }
    setSession(user);
    if (user.role === "admin") router.push("/");
    else router.push(`/parceiro/${user.parceiro}`);
  };

  const inp = {
    width: "100%", background: "#0C0C14", border: "1px solid #25253A",
    borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 15,
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  };

  return (
    <>
      <Head><title>CertTrack - Login</title></Head>
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, #00C89612 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#00C896,#4A9EFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px" }}>🔐</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>CertTrack</h1>
            <p style={{ color: "#555", fontSize: 14, marginTop: 6 }}>Entre com suas credenciais</p>
          </div>
          <div style={{ background: "#10101A", border: "1px solid #1E1E2E", borderRadius: 20, padding: "30px 28px" }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", color: "#888", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>EMAIL</label>
              <input type="text" value={email} placeholder="seu@email" onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#00C896")}
                onBlur={(e) => (e.target.style.borderColor = "#25253A")} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "#888", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SENHA</label>
              <input type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#00C896")}
                onBlur={(e) => (e.target.style.borderColor = "#25253A")} />
            </div>
            {error && (
              <div style={{ marginBottom: 16, background: "#FF4D4D18", border: "1px solid #FF4D4D35", borderRadius: 10, padding: "11px 14px", color: "#FF4D4D", fontSize: 13, textAlign: "center" }}>
                {error}
              </div>
            )}
            <button onClick={submit} disabled={loading || !email.trim() || !password.trim()} style={{
              width: "100%", padding: "15px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#00C896,#4A9EFF)", color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5,
              opacity: !email.trim() || !password.trim() ? 0.4 : 1, transition: "opacity 0.2s",
            }}>
              {loading ? "Entrando..." : "Entrar →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
