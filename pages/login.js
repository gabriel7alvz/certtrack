import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { USERS, setSession, getSession } from "../lib/data";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session && Date.now() - session.loginTime <= 48 * 60 * 60 * 1000) {
      if (session.role === "admin") router.push("/");
      else router.push("/parceiro/" + session.parceiro);
    }
  }, []);

  const submit = () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true); setError("");
    const user = USERS.find(u => u.email === email.trim() && u.password === password.trim());
    if (!user) { setError("Email ou senha incorretos."); setLoading(false); return; }
    setSession({ ...user, loginTime: Date.now() });
    if (user.role === "admin") router.push("/");
    else router.push("/parceiro/" + user.parceiro);
  };

  const inp = { width: "100%", background: "#F5F7FA", border: "1px solid #D0D7DE",
    borderRadius: 10, padding: "13px 16px", color: "#1B2E4B", fontSize: 15,
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" };

  return (
    <>
      <Head><title>CertificaPro - Login</title></Head>
      <div style={{ minHeight: "100vh", background: "#F0F4F0", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, #4CAF5018 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <img src="https://i.imgur.com/yWLzf1T.jpeg" alt="CertificaPro"
              style={{ height: 60, objectFit: "contain", marginBottom: 16, borderRadius: 8 }} />
            <p style={{ color: "#666", fontSize: 14, marginTop: 6 }}>Entre com suas credenciais</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E0E7E0", borderRadius: 20,
            padding: "30px 28px", boxShadow: "0 2px 12px #1B2E4B10" }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", color: "#1B2E4B", fontSize: 11,
                fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>EMAIL</label>
              <input type="text" value={email} placeholder="seu@email"
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()} style={inp}
                onFocus={e => e.target.style.borderColor = "#4CAF50"}
                onBlur={e => e.target.style.borderColor = "#D0D7DE"} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "#1B2E4B", fontSize: 11,
                fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SENHA</label>
              <input type="password" value={password} placeholder="••••••••"
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()} style={inp}
                onFocus={e => e.target.style.borderColor = "#4CAF50"}
                onBlur={e => e.target.style.borderColor = "#D0D7DE"} />
            </div>
            {error && <div style={{ marginBottom: 16, background: "#FFF0F0",
              border: "1px solid #FFCDD2", borderRadius: 10, padding: "11px 14px",
              color: "#C62828", fontSize: 13, textAlign: "center" }}>{error}</div>}
            <button onClick={submit} disabled={loading || !email.trim() || !password.trim()}
              style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#4CAF50,#1B2E4B)", color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              opacity: !email.trim() || !password.trim() ? 0.4 : 1 }}>
              {loading ? "Entrando..." : "Entrar →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
