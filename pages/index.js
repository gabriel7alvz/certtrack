import { useState, useEffect } from "react";
import Head from "next/head";
import { PARTNERS, loadData, saveData, currentMonth, monthLabel, STATUS_COLORS } from "../lib/data";

export default function Admin() {
  const [data, setData] = useState({ indicacoes: [], nomes: {} });
  const [mes, setMes] = useState(currentMonth());
  const [tab, setTab] = useState("dashboard");
  const [nomes, setNomes] = useState({ parceiro1: "Parceiro 1", parceiro2: "Parceiro 2" });
  const [editingNames, setEditNomes] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const d = loadData();
    setData(d);
    if (d.nomes) setNomes((prev) => ({ ...prev, ...d.nomes }));
    setReady(true);
  }, []);

  const refresh = () => {
    const d = loadData();
    setData(d);
    if (d.nomes) setNomes((prev) => ({ ...prev, ...d.nomes }));
  };

  const saveNames = () => {
    const d = loadData();
    d.nomes = nomes;
    saveData(d);
    setData(d);
    setEditNomes(false);
  };

  const updateStatus = (id, status) => {
    const d = loadData();
    d.indicacoes = d.indicacoes.map((i) => (i.id === id ? { ...i, status } : i));
    saveData(d);
    setData({ ...d });
  };

  const del = (id) => {
    if (!confirm("Remover esta indicacao?")) return;
    const d = loadData();
    d.indicacoes = d.indicacoes.filter((i) => i.id !== id);
    saveData(d);
    setData({ ...d });
  };

  const copyLink = (pid) => {
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}/form/${pid}`);
    setCopied(pid);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtradas = data.indicacoes.filter((i) => i.mes === mes);
  const meses = [...new Set(data.indicacoes.map((i) => i.mes))].sort().reverse();

  const stats = PARTNERS.map((p) => ({
    ...p,
    label: nomes[p.id] || p.name,
    total: filtradas.filter((i) => i.parceiro === p.id).length,
    concluidas: filtradas.filter((i) => i.parceiro === p.id && i.status === "Concluido").length,
  }));

  const card = { background: "#0E0E18", border: "1px solid #1A1A28", borderRadius: 18 };

  if (!ready) return null;

  return (
    <>
      <Head><title>CertTrack - Admin</title></Head>
      <div style={{ minHeight: "100vh", background: "#080810" }}>
        <div style={{ background: "#0E0E18", borderBottom: "1px solid #1A1A28", padding: "0 32px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#00C896,#4A9EFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🔐</div>
              <span style={{ fontWeight: 800, fontSize: 15 }}>CertTrack</span>
              <span style={{ color: "#2A2A3A", marginLeft: 4 }}>|</span>
              <span style={{ color: "#444", fontSize: 13 }}>Painel Admin</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={refresh} style={{ background: "#1A1A28", border: "1px solid #25253A", color: "#888", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>↻</button>
              <select value={mes} onChange={(e) => setMes(e.target.value)} style={{ background: "#1A1A28", border: "1px solid #25253A", color: "#ccc", borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer" }}>
                {meses.length === 0 && <option value={currentMonth()}>{monthLabel(currentMonth())}</option>}
                {meses.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 32px" }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 28, background: "#0E0E18", border: "1px solid #1A1A28", borderRadius: 12, padding: 4, width: "fit-content" }}>
            {[["dashboard", "Dashboard"], ["lista", "Indicacoes"], ["parceiros", "Parceiros"]].map(([id, lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: tab === id ? "#1E1E2E" : "transparent", color: tab === id ? "#fff" : "#444", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>{lbl}</button>
            ))}
          </div>

          {tab === "dashboard" && (
            <>
              <p style={{ color: "#444", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 18 }}>{monthLabel(mes)}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                {stats.map((p, i) => (
                  <div key={p.id} className="fadeUp" style={{ ...card, padding: "26px 28px", borderColor: p.color + "28", animationDelay: `${i * 0.1}s`, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: p.color + "08", pointerEvents: "none" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: p.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.label}</div>
                        <div style={{ color: "#444", fontSize: 12 }}>Parceiro</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 24 }}>
                      <div>
                        <div style={{ color: p.color, fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{p.total}</div>
                        <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>indicacoes</div>
                      </div>
                      <div>
                        <div style={{ color: "#00C896", fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{p.concluidas}</div>
                        <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>concluidas</div>
                      </div>
                    </div>
                    {p.total > 0 && (
                      <div style={{ marginTop: 18 }}>
                        <div style={{ height: 3, background: "#1A1A28", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(p.concluidas / p.total) * 100}%`, background: p.color, borderRadius: 3 }} />
                        </div>
                        <div style={{ color: "#444", fontSize: 11, marginTop: 5 }}>{Math.round((p.concluidas / p.total) * 100)}% concluidas</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ ...card, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "#444", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Total no mes</div>
                  <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{filtradas.length} indicacoes</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#444", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Concluidas</div>
                  <div style={{ color: "#00C896", fontSize: 30, fontWeight: 800, marginTop: 4 }}>{filtradas.filter((i) => i.status === "Concluido").length}</div>
                </div>
              </div>
            </>
          )}

          {tab === "lista" && (
            filtradas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#333" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div>Nenhuma indicacao neste mes</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtradas.sort((a, b) => new Date(b.data) - new Date(a.data)).map((ind) => {
                  const p = PARTNERS.find((x) => x.id === ind.parceiro);
                  return (
                    <div key={ind.id} style={{ ...card, padding: "16px 22px", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: (p?.color || "#fff") + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>👤</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700 }}>{ind.nome}</div>
                        <div style={{ color: "#555", fontSize: 13, marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span>{ind.telefone}</span>
                          <span style={{ color: (p?.color || "#fff") + "aa" }}>- {nomes[ind.parceiro] || p?.name}</span>
                          <span>- {ind.tipo}</span>
                          {ind.obs && <span>- {ind.obs}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex"
