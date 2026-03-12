import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { testarFirebase } from "../lib/testFirebase";
import { PARTNERS, loadData, saveData, currentMonth, monthLabel, STATUS_COLORS, getSession, clearSession } from "../lib/data";

export default function Admin() {
  const router = useRouter();
  const [data, setData] = useState({ indicacoes: [], nomes: {} });
  const [mes, setMes] = useState(currentMonth());
  const [tab, setTab] = useState("dashboard");
  const [nomes, setNomes] = useState({ parceiro1: "Parceiro 1", parceiro2: "Parceiro 2" });
  const [editingNames, setEditNomes] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(null);
  useEffect(() => {
    
    testarFirebase();
    
    const session = getSession();
    if (!session || session.role !== "admin") { router.push("/login"); return; }
    const now = Date.now();
    if (now - session.loginTime > 48 * 60 * 60 * 1000) { clearSession(); router.push("/login"); return; }
    const d = loadData();
    setData(d);
    if (d.nomes) setNomes((prev) => ({ ...prev, ...d.nomes }));
    setReady(true);
  }, []);
  const logout = () => { clearSession(); router.push("/login"); };
  const refresh = () => { const d = loadData(); setData(d); if (d.nomes) setNomes((prev) => ({ ...prev, ...d.nomes })); };
  const saveNames = () => { const d = loadData(); d.nomes = nomes; saveData(d); setData(d); setEditNomes(false); };
  const updateStatus = (id, status) => { const d = loadData(); d.indicacoes = d.indicacoes.map((i) => (i.id === id ? { ...i, status } : i)); saveData(d); setData({ ...d }); };
  const del = (id) => { if (!confirm("Remover?")) return; const d = loadData(); d.indicacoes = d.indicacoes.filter((i) => i.id !== id); saveData(d); setData({ ...d }); };
  const copyLink = (pid) => { navigator.clipboard.writeText(`${window.location.origin}/form/${pid}`); setCopied(pid); setTimeout(() => setCopied(null), 2000); };
  const filtradas = data.indicacoes.filter((i) => i.mes === mes);
  const meses = [...new Set(data.indicacoes.map((i) => i.mes))].sort().reverse();
  const stats = PARTNERS.map((p) => ({ ...p, label: nomes[p.id] || p.name, total: filtradas.filter((i) => i.parceiro === p.id).length, concluidas: filtradas.filter((i) => i.parceiro === p.id && i.status === "Concluido").length }));
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
              <span style={{ color: "#444", fontSize: 13, marginLeft: 8 }}>Painel Admin</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={refresh} style={{ background: "#1A1A28", border: "1px solid #25253A", color: "#888", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>↻</button>
              <select value={mes} onChange={(e) => setMes(e.target.value)} style={{ background: "#1A1A28", border: "1px solid #25253A", color: "#ccc", borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer" }}>
                {meses.length === 0 && <option value={currentMonth()}>{monthLabel(currentMonth())}</option>}
                {meses.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </select>
              <button onClick={logout} style={{ background: "#1A1A28", border: "1px solid #25253A", color: "#FF4D4D", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Sair</button>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 32px" }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 28, background: "#0E0E18", border: "1px solid #1A1A28", borderRadius: 12, padding: 4, width: "fit-content" }}>
            {[["dashboard","Dashboard"],["lista","Indicacoes"],["parceiros","Parceiros"]].map(([id,lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: tab === id ? "#1E1E2E" : "transparent", color: tab === id ? "#fff" : "#444", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{lbl}</button>
            ))}
          </div>
          {tab === "dashboard" && (
            <>
              <p style={{ color: "#444", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 18 }}>{monthLabel(mes)}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                {stats.map((p) => (
                  <div key={p.id} style={{ ...card, padding: "26px 28px", borderColor: p.color + "28", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: p.color + "08", pointerEvents: "none" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: p.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                      <div><div style={{ fontWeight: 700 }}>{p.label}</div><div style={{ color: "#444", fontSize: 12 }}>Parceiro</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 24 }}>
                      <div><div style={{ color: p.color, fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{p.total}</div><div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>indicacoes</div></div>
                      <div><div style={{ color: "#00C896", fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{p.concluidas}</div><div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>concluidas</div></div>
                    </div>
                    {p.total > 0 && <div style={{ marginTop: 18 }}><div style={{ height: 3, background: "#1A1A28", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${(p.concluidas/p.total)*100}%`, background: p.color, borderRadius: 3 }} /></div><div style={{ color: "#444", fontSize: 11, marginTop: 5 }}>{Math.round((p.concluidas/p.total)*100)}% concluidas</div></div>}
                  </div>
                ))}
              </div>
              <div style={{ ...card, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div><div style={{ color: "#444", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Total no mes</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{filtradas.length} indicacoes</div></div>
                <div style={{ textAlign: "right" }}><div style={{ color: "#444", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Concluidas</div><div style={{ color: "#00C896", fontSize: 30, fontWeight: 800, marginTop: 4 }}>{filtradas.filter((i) => i.status === "Concluido").length}</div></div>
              </div>
            </>
          )}
          {tab === "lista" && (
            filtradas.length === 0
              ? <div style={{ textAlign: "center", padding: "80px 0", color: "#333" }}><div style={{ fontSize: 48, marginBottom: 12 }}>📋</div><div>Nenhuma indicacao neste mes</div></div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtradas.sort((a,b) => new Date(b.data)-new Date(a.data)).map((ind) => {
                    const p = PARTNERS.find((x) => x.id === ind.parceiro);
                    return (
                      <div key={ind.id} style={{ ...card, padding: "16px 22px", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: (p?.color||"#fff")+"18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>👤</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700 }}>{ind.nomeCompleto || ind.nome}</div>
                          <div style={{ color: "#555", fontSize: 13, marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <span>{ind.telefone}</span>
                            <span style={{ color: (p?.color||"#fff")+"aa" }}>- {nomes[ind.parceiro]||p?.name}</span>
                            <span>- {ind.tipo}</span>
                            {ind.cpf && <span>CPF: {ind.cpf}</span>}
                            {ind.cnpj && <span>CNPJ: {ind.cnpj}</span>}
                            {ind.razaoSocial && <span>{ind.razaoSocial}</span>}
                            {ind.obs && <span>- {ind.obs}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <select value={ind.status} onChange={(e) => updateStatus(ind.id, e.target.value)} style={{ background: STATUS_COLORS[ind.status]+"18", border: `1px solid ${STATUS_COLORS[ind.status]}38`, color: STATUS_COLORS[ind.status], borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                            {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={() => del(ind.id)} style={{ background: "transparent", border: "1px solid #1A1A28", color: "#444", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>x</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
          )}
          {tab === "parceiros" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ ...card, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <h2 style={{ fontWeight: 800, fontSize: 18 }}>Nomes dos Parceiros</h2>
                  {!editingNames
                    ? <button onClick={() => setEditNomes(true)} style={{ background: "#1A1A28", border: "1px solid #25253A", color: "#888", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Editar</button>
                    : <button onClick={saveNames} style={{ background: "#00C896", border: "none", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Salvar</button>}
                </div>
                {PARTNERS.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                    {editingNames
                      ? <input value={nomes[p.id]||""} onChange={(e) => setNomes((prev) => ({ ...prev, [p.id]: e.target.value }))} style={{ background: "#080810", border: "1px solid #25253A", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, flex: 1, outline: "none" }} />
                      : <span style={{ fontSize: 15, fontWeight: 600 }}>{nomes[p.id]||p.name}</span>}
                  </div>
                ))}
              </div>
              <div style={{ ...card, padding: 28 }}>
                <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Links dos Formularios</h2>
                <p style={{ color: "#555", fontSize: 13, marginBottom: 22 }}>Envie para cada parceiro. Ao abrir, verao o formulario vinculado ao nome deles.</p>
                {PARTNERS.map((p) => (
                  <div key={p.id} style={{ background: "#080810", border: `1px solid ${p.color}25`, borderRadius: 12, padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{nomes[p.id]||p.name}</div>
                      <div style={{ color: p.color, fontSize: 12, fontFamily: "monospace" }}>{typeof window !== "undefined" ? window.location.origin : ""}/form/{p.id}</div>
                    </div>
                    <button onClick={() => copyLink(p.id)} style={{ background: copied===p.id ? "#00C89620" : p.color+"18", border: `1px solid ${copied===p.id ? "#00C89640" : p.color+"38"}`, color: copied===p.id ? "#00C896" : p.color, borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {copied===p.id ? "Copiado!" : "Copiar Link"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
