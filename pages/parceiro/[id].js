import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { PARTNERS, loadData, currentMonth, monthLabel, getSession, clearSession } from "../../lib/data";

const STATUS_COLORS = {
  "Aguardando": "#F59E0B", "Em contato": "#1976D2",
  "Aguardando informacoes": "#7B1FA2", "Agendado": "#E65100",
  "Certificado emitido": "#2E7D32", "Cancelado": "#C62828",
};

export default function ParceiroPage() {
  const router = useRouter();
  const { id } = router.query;
  const partner = PARTNERS.find(p => p.id === id);
  const [data, setData] = useState({ indicacoes: [], nomes: {} });
  const [mes, setMes] = useState(currentMonth());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    const session = getSession();
    if (!session) { router.push("/login"); return; }
    if (Date.now() - session.loginTime > 48 * 60 * 60 * 1000) { clearSession(); router.push("/login"); return; }
    if (session.role === "parceiro" && session.parceiro !== id) { router.push("/login"); return; }
    loadData().then(d => { setData(d); setReady(true); });
  }, [id]);

  const logout = () => { clearSession(); router.push("/login"); };
  const refresh = () => loadData().then(d => setData(d));

  if (!partner || !ready) return <div style={{ minHeight: "100vh", background: "#F0F4F0",
    display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>Carregando...</div>;

  const c = "#4CAF50";
  const nomeDisplay = data.nomes?.[partner.id] || partner.name;
  const todasMinhas = data.indicacoes.filter(i => i.parceiro === partner.id);
  const meses = [...new Set(todasMinhas.map(i => i.mes))].sort().reverse();
  const filtradas = todasMinhas.filter(i => i.mes === mes);
  const total = filtradas.length;
  const concluidas = filtradas.filter(i => i.status === "Certificado emitido").length;
  const aguardando = filtradas.filter(i => i.status === "Aguardando").length;
  const emAndamento = filtradas.filter(i =>
    i.status === "Em contato" || i.status === "Agendado" || i.status === "Aguardando informacoes").length;
  const card = { background: "#fff", border: "1px solid #E0E7E0", borderRadius: 16, boxShadow: "0 1px 4px #1B2E4B0A" };

  return (
    <>
      <Head><title>{nomeDisplay} - Minhas Indicacoes</title></Head>
      <div style={{ minHeight: "100vh", background: "#F0F4F0", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #E0E7E0", padding: "0 24px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", height: 64,
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="https://i.imgur.com/yWLzf1T.jpeg" alt="CertificaPro"
                style={{ height: 32, objectFit: "contain", borderRadius: 4 }} />
              <span style={{ color: "#999", fontSize: 13 }}>· {nomeDisplay}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={refresh} style={{ background: "#F5F7FA", border: "1px solid #E0E7E0",
                color: "#666", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>↻</button>
              <button onClick={() => router.push("/form/" + id)} style={{ background: c+"15",
                border: "1px solid " + c + "40", color: c, borderRadius: 8, padding: "7px 14px",
                fontSize: 13, cursor: "pointer", fontWeight: 600 }}>+ Nova</button>
              <button onClick={logout} style={{ background: "#FFF0F0", border: "1px solid #FFCDD2",
                color: "#C62828", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Sair</button>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <p style={{ color: "#999", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{monthLabel(mes)}</p>
            <select value={mes} onChange={e => setMes(e.target.value)}
              style={{ background: "#fff", border: "1px solid #E0E7E0", color: "#1B2E4B",
              borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>
              {meses.length === 0 && <option value={currentMonth()}>{monthLabel(currentMonth())}</option>}
              {meses.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ ...card, padding: "20px 22px", borderColor: c+"40" }}>
              <div style={{ color: c, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{total}</div>
              <div style={{ color: "#999", fontSize: 13, marginTop: 6 }}>indicacoes no mes</div></div>
            <div style={{ ...card, padding: "20px 22px", borderColor: "#2E7D3240" }}>
              <div style={{ color: "#2E7D32", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{concluidas}</div>
              <div style={{ color: "#999", fontSize: 13, marginTop: 6 }}>emitidos</div></div>
            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ color: "#F59E0B", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{aguardando}</div>
              <div style={{ color: "#999", fontSize: 13, marginTop: 6 }}>aguardando</div></div>
            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ color: "#1976D2", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{emAndamento}</div>
              <div style={{ color: "#999", fontSize: 13, marginTop: 6 }}>em andamento</div></div>
          </div>
          {filtradas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14, color: "#999" }}>Nenhuma indicacao neste mes</div>
              <button onClick={() => router.push("/form/" + id)} style={{ marginTop: 16,
                background: c, border: "none", color: "#fff", borderRadius: 10, padding: "12px 24px",
                fontSize: 14, cursor: "pointer", fontWeight: 700 }}>Fazer primeira indicacao</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtradas.sort((a,b) => new Date(b.data)-new Date(a.data)).map(ind => (
                <div key={ind._firebaseId} style={{ ...card, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1B2E4B" }}>{ind.nomeCompleto}</div>
                    <div style={{ background: (STATUS_COLORS[ind.status]||"#888")+"18",
                      border: "1px solid " + (STATUS_COLORS[ind.status]||"#888") + "38",
                      color: STATUS_COLORS[ind.status]||"#888", borderRadius: 6,
                      padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{ind.status}</div>
                  </div>
                  <div style={{ color: "#888", fontSize: 13, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>{ind.telefone}</span>
                    {ind.email && <span>· {ind.email}</span>}
                    <span>· {ind.tipo}</span>
                    {ind.cpf && <span>· CPF: {ind.cpf}</span>}
                    {ind.obs && <span>· {ind.obs}</span>}
                  </div>
                  <div style={{ color: "#bbb", fontSize: 11, marginTop: 8 }}>
                    {new Date(ind.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
