import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { PARTNERS, loadData, currentMonth, monthLabel, STATUS_COLORS, getSession, clearSession } from "../../lib/data";

export default function ParceiroPage() {
  const router = useRouter();
  const { id } = router.query;
  const partner = PARTNERS.find((p) => p.id === id);
  const [data, setData] = useState({ indicacoes: [], nomes: {} });
  const [mes, setMes] = useState(currentMonth());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    const session = getSession();
    if (!session) { router.push("/login"); return; }
    if (Date.now() - session.loginTime > 48 * 60 * 60 * 1000) { clearSession(); router.push("/login"); return; }
    if (session.role === "parceiro" && session.parceiro !== id) { router.push("/login"); return; }
    loadData().then((d) => { setData(d); setReady(true); });
  }, [id]);

  const logout = () => { clearSession(); router.push("/login"); };
  const refresh = () => loadData().then((d) => setData(d));

  if (!partner || !ready) return <div style={{ minHeight: "100vh", background: "#060810", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "sans-serif" }}>Carregando...</div>;

  const c = "#4CAF50";
  const nomeDisplay = data.nomes?.[partner.id] || partner.name;
  const todasMinhas = data.indicacoes.filter((i) => i.parceiro === partner.id);
  const meses = [...new Set(todasMinhas.map((i) => i.mes))].sort().reverse();
  const filtradas = todasMinhas.filter((i) => i.mes === mes);
  const total = filtradas.length;
  const concluidas = filtradas.filter((i) => i.status === "Certificado emitido").length;
  const aguardando = filtradas.filter((i) => i.status === "Aguardando").length;
  const emAndamento = filtradas.filter((i) => i.status === "Em contato" || i.status === "Agendado" || i.status === "Aguardando informacoes").length;
  const card = { background: "#0E1018", border: "1px solid #1A2030", borderRadius: 16 };

  return (
    <>
      <Head><title>{nomeDisplay} - Minhas Indicacoes</title></Head>
      <div style={{ minHeight: "100vh", background: "#060810", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: `radial-gradient(ellipse, ${c}12 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ background: "#0E1018", borderBottom: "1px solid #1A2030", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 600, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="https://i.imgur.com/yWLzf1T.jpeg" alt="CertificaPro" style={{ height: 32, objectFit: "contain", borderRadius: 4 }} />
              <span style={{ color: "#444", fontSize: 13 }}>· {nomeDisplay}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={refresh} style={{ background: "#1A2030", border: "1px solid #252535", color: "#888", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>↻</button>
              <button onClick={() => router.push(`/form/${id}`)} style={{ background: c+"18", border: `1px solid ${c}35`, color: c, borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>+ Nova</button>
              <button onClick={logout} style={{ background: "#1A2030", border: "1px solid #252535", color: "#FF4D4D", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Sair</button>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 24px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <p style={{ color: "#444", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{monthLabel(mes)}</p>
            <select value={mes} onChange={(e) => setMes(e.target.value)} style={{ background: "#1A2030", border: "1px solid #252535", color: "#ccc", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {meses.length === 0 && <option value={currentMonth()}>{monthLabel(currentMonth())}</option>}
              {meses.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ ...card, padding: "20px 22px", borderColor: c+"28" }}><div style={{ color: c, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{total}</div><div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>indicacoes no mes</div></div>
            <div style={{ ...card, padding: "20px 22px", borderColor: "#4CAF5028" }}><div style={{ color: "#4CAF50", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{concluidas}</div><div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>emitidos</div></div>
            <div style={{ ...card, padding: "20px 22px" }}><div style={{ color: "#FFB800", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{aguardando}</div><div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>aguardando</div></div>
            <div style={{ ...card, padding: "20px 22px" }}><div style={{ color: "#4A9EFF", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{emAndamento}</div><div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>em andamento</div></div>
          </div>
          {filtradas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14 }}>Nenhuma indicacao neste mes</div>
              <button onClick={() => router.push(`/form/${id}`)} style={{ marginTop: 16, background: c, border: "none", color: "#fff", borderRadius: 10, padding: "12px 24px", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>Fazer primeira indicacao</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtradas.sort((a,b) => new Date(b.data)-new Date(a.data)).map((ind) => (
                <div key={ind._firebaseId} style={{ ...card, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{ind.nomeCompleto || ind.nome}</div>
                    <div style={{ background: (STATUS_COLORS[ind.status]||"#888")+"18", border: `1px solid ${(STATUS_COLORS[ind.status]||"#888")}38`, color: STATUS_COLORS[ind.status]||"#888", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{ind.status}</div>
                  </div>
                  <div style={{ color: "#555", fontSize: 13, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>{ind.telefone}</span>
                    {ind.email && <span>· {ind.email}</span>}
                    <span>· {ind.tipo}</span>
                    {ind.cpf && <span>· CPF: {ind.cpf}</span>}
                    {ind.cnpj && <span>· CNPJ: {ind.cnpj}</span>}
                    {ind.razaoSocial && <span>· {ind.razaoSocial}</span>}
                    {ind.obs && <span>· {ind.obs}</span>}
                  </div>
                  <div style={{ color: "#333", fontSize: 11, marginTop: 8 }}>{new Date(ind.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
