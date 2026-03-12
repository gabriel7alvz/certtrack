import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { PARTNERS, loadData, currentMonth, monthLabel, STATUS_COLORS } from "../../lib/data";

export default function ParceiroPage() {
  const router = useRouter();
  const { id } = router.query;
  const partner = PARTNERS.find((p) => p.id === id);
  const [data, setData] = useState({ indicacoes: [], nomes: {} });
  const [mes, setMes] = useState(currentMonth());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const d = loadData();
    setData(d);
    setReady(true);
  }, []);

  if (!partner) return null;
  if (!ready) return null;

  const c = partner.color;
  const nomeDisplay = data.nomes?.[partner.id] || partner.name;
  const todasMinhas = data.indicacoes.filter((i) => i.parceiro === partner.id);
  const meses = [...new Set(todasMinhas.map((i) => i.mes))].sort().reverse();
  const filtradas = todasMinhas.filter((i) => i.mes === mes);

  const total = filtradas.length;
  const concluidas = filtradas.filter((i) => i.status === "Concluido").length;
  const aguardando = filtradas.filter((i) => i.status === "Aguardando").length;
  const emAndamento = filtradas.filter((i) => i.status === "Em andamento").length;

  const card = { background: "#10101A", border: "1px solid #1E1E2E", borderRadius: 16 };

  return (
    <>
      <Head><title>{nomeDisplay} - Minhas Indicacoes</title></Head>
      <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: `radial-gradient(ellipse, ${c}12 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

        {/* Header */}
        <div style={{ background: "#0E0E18", borderBottom: "1px solid #1A1A28", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 600, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{nomeDisplay}</span>
              <span style={{ color: "#444", fontSize: 13 }}>· Minhas Indicacoes</span>
            </div>
            <button onClick={() => router.push(`/form/${id}`)} style={{ background: c + "18", border: `1px solid ${c}35`, color: c, borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              + Nova Indicacao
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 24px", position: "relative", zIndex: 1 }}>

          {/* Seletor de mês */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <p style={{ color: "#444", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              {monthLabel(mes)}
            </p>
            <select value={mes} onChange={(e) => setMes(e.target.value)}
              style={{ background: "#1A1A28", border: "1px solid #25253A", color: "#ccc", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {meses.length === 0 && <option value={currentMonth()}>{monthLabel(currentMonth())}</option>}
              {meses.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ ...card, padding: "20px 22px", borderColor: c + "28" }}>
              <div style={{ color: c, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{total}</div>
              <div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>indicacoes no mes</div>
            </div>
            <div style={{ ...card, padding: "20px 22px", borderColor: "#00C89628" }}>
              <div style={{ color: "#00C896", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{concluidas}</div>
              <div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>concluidas</div>
            </div>
            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ color: "#FFB800", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{aguardando}</div>
              <div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>aguardando</div>
            </div>
            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ color: "#4A9EFF", fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{emAndamento}</div>
              <div style={{ color: "#555", fontSize: 13, marginTop: 6 }}>em andamento</div>
            </div>
          </div>

          {/* Lista */}
          {filtradas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 14 }}>Nenhuma indicacao neste mes</div>
              <button onClick={() => router.push(`/form/${id}`)} style={{ marginTop: 16, background: c, border: "none", color: "#fff", borderRadius: 10, padding: "12px 24px", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
                Fazer primeira indicacao
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtradas.sort((a, b) => new Date(b.data) - new Date(a.data)).map((ind) => (
                <div key={ind.id} style={{ ...card, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{ind.nomeCompleto || ind.nome}</div>
                    <div style={{ background: STATUS_COLORS[ind.status] + "18", border: `1px solid ${STATUS_COLORS[ind.status]}38`, color: STATUS_COLORS[ind.status], borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>
                      {ind.status}
                    </div>
                  </div>
                  <div style={{ color: "#555", fontSize: 13, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>{ind.telefone}</span>
                    <span>· {ind.tipo}</span>
                    {ind.cpf && <span>· CPF: {ind.cpf}</span>}
                    {ind.cnpj && <span>· CNPJ: {ind.cnpj}</span>}
                    {ind.razaoSocial && <span>· {ind.razaoSocial}</span>}
                    {ind.obs && <span>· {ind.obs}</span>}
                  </div>
                  <div style={{ color: "#333", fontSize: 11, marginTop: 8 }}>
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
