import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PARTNERS, loadData, updateStatus, deleteIndicacao, saveNomes, currentMonth, monthLabel, getSession, clearSession } from "../lib/data";
 
const COLUNAS = [
  { id: "Aguardando", label: "Aguardando", color: "#FFB800" },
  { id: "Em contato", label: "Em contato", color: "#4A9EFF" },
  { id: "Aguardando informacoes", label: "Aguard. Informações", color: "#A78BFA" },
  { id: "Agendado", label: "Agendado", color: "#F97316" },
  { id: "Certificado emitido", label: "Cert. Emitido", color: "#00C896" },
  { id: "Concluido", label: "Concluído", color: "#00C896" },
];

const STATUS_COLORS = {
  "Aguardando": "#FFB800",
  "Em contato": "#4A9EFF",
  "Aguardando informacoes": "#A78BFA",
  "Agendado": "#F97316",
  "Certificado emitido": "#00C896",
  "Concluido": "#00C896",
  "Cancelado": "#FF4D4D",
};

export default function Admin() {
  const router = useRouter();
  const [data, setData] = useState({ indicacoes: [], nomes: {} });
  const [mes, setMes] = useState(currentMonth());
  const [tab, setTab] = useState("kanban");
  const [nomes, setNomes] = useState({ rafamaceno: "Rafa Maceno", parceiro2: "Parceiro 2" });
  const [editingNames, setEditNomes] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelMotivo, setCancelMotivo] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") { router.push("/login"); return; }
    if (Date.now() - session.loginTime > 48 * 60 * 60 * 1000) { clearSession(); router.push("/login"); return; }
    loadData().then((d) => { setData(d); if (d.nomes) setNomes((prev) => ({ ...prev, ...d.nomes })); setReady(true); });
  }, []);

  const refresh = () => loadData().then((d) => { setData(d); if (d.nomes) setNomes((prev) => ({ ...prev, ...d.nomes })); });
  const logout = () => { clearSession(); router.push("/login"); };

  const handleUpdateStatus = async (firebaseId, status, motivo) => {
    const extra = motivo ? { motivoCancelamento: motivo } : {};
    await updateStatus(firebaseId, status, extra);
    setData((prev) => ({ ...prev, indicacoes: prev.indicacoes.map((i) => i._firebaseId === firebaseId ? { ...i, status, ...extra } : i) }));
  };

  const handleDelete = async (firebaseId) => {
    if (!confirm("Remover esta indicacao?")) return;
    await deleteIndicacao(firebaseId);
    setData((prev) => ({ ...prev, indicacoes: prev.indicacoes.filter((i) => i._firebaseId !== firebaseId) }));
  };

  const handleSaveNomes = async () => { await saveNomes(nomes); setEditNomes(false); };
  const copyLink = (pid) => { navigator.clipboard.writeText(`${window.location.origin}/form/${pid}`); setCopied(pid); setTimeout(() => setCopied(null), 2000); };

  const onDragStart = () => setDragging(true);

  const onDragEnd = (result) => {
    setDragging(false);
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const novoStatus = destination.droppableId;
    if (novoStatus === "Cancelado") {
      setCancelModal(draggableId);
      setCancelMotivo("");
      return;
    }
    handleUpdateStatus(draggableId, novoStatus);
  };

  const confirmarCancelamento = () => {
    if (!cancelModal) return;
    handleUpdateStatus(cancelModal, "Cancelado", cancelMotivo);
    setCancelModal(null);
    setCancelMotivo("");
  };

  const filtradas = data.indicacoes.filter((i) => i.mes === mes);
  const canceladas = filtradas.filter((i) => i.status === "Cancelado");
  const meses = [...new Set(data.indicacoes.map((i) => i.mes))].sort().reverse();
  const card = { background: "#0E0E18", border: "1px solid #1A1A28", borderRadius: 18 };

  if (!ready) return <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "sans-serif" }}>Carregando...</div>;

  const CardIndicacao = ({ ind, index }) => {
    const p = PARTNERS.find((x) => x.id === ind.parceiro);
    return (
      <Draggable draggableId={ind._firebaseId} index={index}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
            style={{ background: snapshot.isDragging ? "#1E1E32" : "#13131F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "grab", boxShadow: snapshot.isDragging ? "0 8px 32px #00000060" : "none", ...provided.draggableProps.style }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", lineHeight: 1.3 }}>{ind.nomeCompleto || ind.nome}</div>
              <button onClick={() => handleDelete(ind._firebaseId)} style={{ background: "transparent", border: "none", color: "#333", cursor: "pointer", fontSize: 14, padding: "0 0 0 8px", flexShrink: 0 }}>×</button>
            </div>
            <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>{ind.telefone} · {ind.tipo}</div>
            {ind.cpf && <div style={{ color: "#444", fontSize: 10 }}>CPF: {ind.cpf}</div>}
            {ind.cnpj && <div style={{ color: "#444", fontSize: 10 }}>CNPJ: {ind.cnpj}</div>}
            {ind.razaoSocial && <div style={{ color: "#444", fontSize: 10 }}>{ind.razaoSocial}</div>}
            {ind.obs && <div style={{ color: "#555", fontSize: 10, marginTop: 4, fontStyle: "italic" }}>{ind.obs}</div>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <div style={{ color: (p?.color||"#fff")+"99", fontSize: 10, fontWeight: 700 }}>{nomes[ind.parceiro]||p?.name}</div>
              <div style={{ color: "#333", fontSize: 10 }}>{new Date(ind.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };
return (
    <>
      <Head><title>CertTrack - Admin</title></Head>
      {cancelModal && (
        <div style={{ position: "fixed", inset: 0, background: "#00000090", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#10101A", border: "1px solid #FF4D4D35", borderRadius: 20, padding: "28px 28px", width: "100%", maxWidth: 420 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#fff" }}>Motivo do Cancelamento</h3>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 20 }}>Descreva o motivo para cancelar esta indicacao.</p>
            <textarea value={cancelMotivo} onChange={(e) => setCancelMotivo(e.target.value)} placeholder="Ex: Cliente desistiu, ja possui certificado..." rows={3}
              style={{ width: "100%", background: "#080810", border: "1px solid #25253A", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setCancelModal(null)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #25253A", background: "transparent", color: "#888", fontSize: 14, cursor: "pointer" }}>Voltar</button>
              <button onClick={confirmarCancelamento} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#FF4D4D", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ minHeight: "100vh", background: "#080810" }}>
        <div style={{ background: "#0E0E18", borderBottom: "1px solid #1A1A28", padding: "0 32px" }}>
          <div style={{ maxWidth: "100%", margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 24, background: "#0E0E18", border: "1px solid #1A1A28", borderRadius: 12, padding: 4, width: "fit-content" }}>
            {[["kanban","Kanban"],["parceiros","Parceiros"]].map(([id,lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 20px", borderRadius: 9, border: "none", background: tab === id ? "#1E1E2E" : "transparent", color: tab === id ? "#fff" : "#444", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{lbl}</button>
            ))}
          </div>
          {tab === "kanban" && (
            <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
                {COLUNAS.map((col) => {
                  const cards = filtradas.filter((i) => i.status === col.id).sort((a,b) => new Date(b.data)-new Date(a.data));
                  return (
                    <div key={col.id} style={{ minWidth: 240, maxWidth: 240, flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{col.label}</span>
                        <span style={{ background: col.color+"20", color: col.color, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>{cards.length}</span>
                      </div>
                      <Droppable droppableId={col.id}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}
                            style={{ minHeight: 80, background: snapshot.isDraggingOver ? col.color+"0A" : "#0C0C14", border: `1px solid ${snapshot.isDraggingOver ? col.color+"30" : "#1A1A28"}`, borderRadius: 12, padding: 8, transition: "all 0.2s" }}>
                            {cards.map((ind, index) => <CardIndicacao key={ind._firebaseId} ind={ind} index={index} />)}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
                <div style={{ minWidth: 240, maxWidth: 240, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF4D4D" }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>Cancelado</span>
                    <span style={{ background: "#FF4D4D20", color: "#FF4D4D", borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>{canceladas.length}</span>
                  </div>
                  <Droppable droppableId="Cancelado">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        style={{ minHeight: 80, background: snapshot.isDraggingOver ? "#FF4D4D0A" : "#0C0C14", border: `1px solid ${snapshot.isDraggingOver ? "#FF4D4D30" : "#1A1A28"}`, borderRadius: 12, padding: 8, transition: "all 0.2s" }}>
                        {canceladas.map((ind, index) => {
                          const p = PARTNERS.find((x) => x.id === ind.parceiro);
                          return (
                            <Draggable key={ind._firebaseId} draggableId={ind._firebaseId} index={index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                  style={{ background: snapshot.isDragging ? "#1E1E32" : "#13131F", border: "1px solid #FF4D4D20", borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "grab", ...provided.draggableProps.style }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{ind.nomeCompleto || ind.nome}</div>
                                    <button onClick={() => handleDelete(ind._firebaseId)} style={{ background: "transparent", border: "none", color: "#333", cursor: "pointer", fontSize: 14, padding: "0 0 0 8px" }}>×</button>
                                  </div>
                                  <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>{ind.telefone} · {ind.tipo}</div>
                                  {ind.motivoCancelamento && <div style={{ background: "#FF4D4D12", border: "1px solid #FF4D4D25", borderRadius: 6, padding: "6px 8px", color: "#FF4D4D", fontSize: 10, marginTop: 6 }}>Motivo: {ind.motivoCancelamento}</div>}
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                                    <div style={{ color: (p?.color||"#fff")+"99", fontSize: 10, fontWeight: 700 }}>{nomes[ind.parceiro]||p?.name}</div>
                                    <div style={{ color: "#333", fontSize: 10 }}>{new Date(ind.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
          )}
{tab === "parceiros" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
              <div style={{ ...card, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <h2 style={{ fontWeight: 800, fontSize: 18 }}>Nomes dos Parceiros</h2>
                  {!editingNames
                    ? <button onClick={() => setEditNomes(true)} style={{ background: "#1A1A28", border: "1px solid #25253A", color: "#888", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Editar</button>
                    : <button onClick={handleSaveNomes} style={{ background: "#00C896", border: "none", color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Salvar</button>}
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
