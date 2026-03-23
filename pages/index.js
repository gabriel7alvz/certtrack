import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PARTNERS, loadData, updateStatus, deleteIndicacao, saveNomes, currentMonth, monthLabel, getSession, clearSession } from "../lib/data";

const COLUNAS = [
  { id: "Aguardando", label: "Aguardando", color: "#F59E0B", bg: "#FFFBF0", border: "#FFE082" },
  { id: "Em contato", label: "Em contato", color: "#1976D2", bg: "#F0F6FF", border: "#BBDEFB" },
  { id: "Aguardando informacoes", label: "Aguard. Informacoes", color: "#7B1FA2", bg: "#F5F0FF", border: "#E1BEE7" },
  { id: "Agendado", label: "Agendado", color: "#E65100", bg: "#FFF3E0", border: "#FFCC80" },
  { id: "Certificado emitido", label: "Cert. Emitido", color: "#2E7D32", bg: "#F0F9F0", border: "#C8E6C9" },
];

const STATUS_COLORS = {
  "Aguardando": "#F59E0B", "Em contato": "#1976D2",
  "Aguardando informacoes": "#7B1FA2", "Agendado": "#E65100",
  "Certificado emitido": "#2E7D32", "Cancelado": "#C62828",
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

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") { router.push("/login"); return; }
    if (Date.now() - session.loginTime > 48 * 60 * 60 * 1000) { clearSession(); router.push("/login"); return; }
    loadData().then(d => { setData(d); if (d.nomes) setNomes(prev => ({ ...prev, ...d.nomes })); setReady(true); });
  }, []);

  const refresh = () => loadData().then(d => { setData(d); if (d.nomes) setNomes(prev => ({ ...prev, ...d.nomes })); });
  const logout = () => { clearSession(); router.push("/login"); };

  const handleUpdateStatus = async (firebaseId, status, motivo) => {
    const extra = motivo ? { motivoCancelamento: motivo } : {};
    await updateStatus(firebaseId, status, extra);
    setData(prev => ({ ...prev, indicacoes: prev.indicacoes.map(i =>
      i._firebaseId === firebaseId ? { ...i, status, ...extra } : i) }));
  };

  const handleDelete = async (firebaseId) => {
    if (!confirm("Remover esta indicacao?")) return;
    await deleteIndicacao(firebaseId);
    setData(prev => ({ ...prev, indicacoes: prev.indicacoes.filter(i => i._firebaseId !== firebaseId) }));
  };

  const handleSaveNomes = async () => { await saveNomes(nomes); setEditNomes(false); };
  const copyLink = pid => { navigator.clipboard.writeText(window.location.origin + "/form/" + pid); setCopied(pid); setTimeout(() => setCopied(null), 2000); };

  const onDragEnd = result => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const novoStatus = destination.droppableId;
    if (novoStatus === "Cancelado") { setCancelModal(draggableId); setCancelMotivo(""); return; }
    handleUpdateStatus(draggableId, novoStatus);
  };

  const confirmarCancelamento = () => {
    if (!cancelModal) return;
    handleUpdateStatus(cancelModal, "Cancelado", cancelMotivo);
    setCancelModal(null); setCancelMotivo("");
  };

  const filtradas = data.indicacoes.filter(i => i.mes === mes);
  const canceladas = filtradas.filter(i => i.status === "Cancelado");
  const meses = [...new Set(data.indicacoes.map(i => i.mes))].sort().reverse();
  const card = { background: "#fff", border: "1px solid #E0E7E0", borderRadius: 18, boxShadow: "0 1px 4px #1B2E4B0A" };

  if (!ready) return <div style={{ minHeight: "100vh", background: "#F0F4F0",
    display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>Carregando...</div>;

  const CardIndicacao = ({ ind, index }) => {
    const p = PARTNERS.find(x => x.id === ind.parceiro);
    return (
      <Draggable draggableId={ind._firebaseId} index={index}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
            style={{ background: snapshot.isDragging ? "#F0F9F0" : "#fff",
              border: "1px solid #E0E7E0", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
              cursor: "grab", boxShadow: snapshot.isDragging ? "0 8px 24px #1B2E4B20" : "none",
              ...provided.draggableProps.style }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1B2E4B" }}>{ind.nomeCompleto || ind.nome}</div>
              <button onClick={() => handleDelete(ind._firebaseId)}
                style={{ background: "transparent", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: "0 0 0 8px" }}>×</button>
            </div>
            <div style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>{ind.telefone} · {ind.tipo}</div>
            {ind.email && <div style={{ color: "#aaa", fontSize: 10 }}>{ind.email}</div>}
            {ind.cpf && <div style={{ color: "#aaa", fontSize: 10 }}>CPF: {ind.cpf}</div>}
            {ind.cnpj && <div style={{ color: "#aaa", fontSize: 10 }}>CNPJ: {ind.cnpj}</div>}
            {ind.razaoSocial && <div style={{ color: "#aaa", fontSize: 10 }}>{ind.razaoSocial}</div>}
            {ind.obs && <div style={{ color: "#aaa", fontSize: 10, marginTop: 4, fontStyle: "italic" }}>{ind.obs}</div>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <div style={{ color: "#4CAF50", fontSize: 10, fontWeight: 700 }}>{nomes[ind.parceiro]||p?.name}</div>
              <div style={{ color: "#bbb", fontSize: 10 }}>{new Date(ind.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };
return (
    <>
      <Head><title>CertificaPro - Admin</title></Head>
      {cancelModal && (
        <div style={{ position: "fixed", inset: 0, background: "#00000060", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #E0E7E0", borderRadius: 20,
            padding: "28px", width: "100%", maxWidth: 420, boxShadow: "0 8px 32px #1B2E4B20" }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#1B2E4B" }}>Motivo do Cancelamento</h3>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Descreva o motivo para cancelar.</p>
            <textarea value={cancelMotivo} onChange={e => setCancelMotivo(e.target.value)}
              placeholder="Ex: Cliente desistiu..." rows={3}
              style={{ width: "100%", background: "#F5F7FA", border: "1px solid #D0D7DE",
              borderRadius: 10, padding: "12px 14px", color: "#1B2E4B", fontSize: 14,
              outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setCancelModal(null)} style={{ flex: 1, padding: "12px",
                borderRadius: 10, border: "1px solid #E0E7E0", background: "#F5F7FA",
                color: "#666", fontSize: 14, cursor: "pointer" }}>Voltar</button>
              <button onClick={confirmarCancelamento} style={{ flex: 1, padding: "12px",
                borderRadius: 10, border: "none", background: "#C62828", color: "#fff",
                fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ minHeight: "100vh", background: "#F0F4F0" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #E0E7E0", padding: "0 32px" }}>
          <div style={{ maxWidth: "100%", margin: "0 auto", height: 64,
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="https://i.imgur.com/yWLzf1T.jpeg" alt="CertificaPro"
                style={{ height: 38, objectFit: "contain", borderRadius: 6 }} />
              <span style={{ color: "#999", fontSize: 13 }}>Painel Admin</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={refresh} style={{ background: "#F5F7FA", border: "1px solid #E0E7E0",
                color: "#666", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>↻</button>
              <select value={mes} onChange={e => setMes(e.target.value)}
                style={{ background: "#F5F7FA", border: "1px solid #E0E7E0", color: "#1B2E4B",
                borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer" }}>
                {meses.length === 0 && <option value={currentMonth()}>{monthLabel(currentMonth())}</option>}
                {meses.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </select>
              <button onClick={logout} style={{ background: "#FFF0F0", border: "1px solid #FFCDD2",
                color: "#C62828", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Sair</button>
            </div>
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 24, background: "#fff",
            border: "1px solid #E0E7E0", borderRadius: 12, padding: 4, width: "fit-content" }}>
            {[["kanban","Kanban"],["parceiros","Parceiros"]].map(([id,lbl]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 20px",
                borderRadius: 9, border: "none", background: tab === id ? "#1B2E4B" : "transparent",
                color: tab === id ? "#fff" : "#999", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{lbl}</button>
            ))}
          </div>
          {tab === "kanban" && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, alignItems: "flex-start" }}>
                {COLUNAS.map(col => {
                  const cards = filtradas.filter(i => i.status === col.id).sort((a,b) => new Date(b.data)-new Date(a.data));
                  return (
                    <div key={col.id} style={{ minWidth: 240, maxWidth: 240, flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1B2E4B" }}>{col.label}</span>
                        <span style={{ background: col.bg, color: col.color, border: "1px solid " + col.border,
                          borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>{cards.length}</span>
                      </div>
                      <Droppable droppableId={col.id}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}
                            style={{ minHeight: 80, background: snapshot.isDraggingOver ? col.bg : "#FAFAFA",
                              border: "1px solid " + (snapshot.isDraggingOver ? col.border : "#E0E7E0"),
                              borderRadius: 12, padding: 8, transition: "all 0.2s" }}>
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
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C62828" }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#1B2E4B" }}>Cancelado</span>
                    <span style={{ background: "#FFF5F5", color: "#C62828", border: "1px solid #FFCDD2",
                      borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>{canceladas.length}</span>
                  </div>
                  <Droppable droppableId="Cancelado">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        style={{ minHeight: 80, background: snapshot.isDraggingOver ? "#FFF5F5" : "#FAFAFA",
                          border: "1px solid " + (snapshot.isDraggingOver ? "#FFCDD2" : "#E0E7E0"),
                          borderRadius: 12, padding: 8, transition: "all 0.2s" }}>
                        {canceladas.map((ind, index) => {
                          const p = PARTNERS.find(x => x.id === ind.parceiro);
                          return (
                            <Draggable key={ind._firebaseId} draggableId={ind._firebaseId} index={index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                  style={{ background: "#fff", border: "1px solid #FFCDD2",
                                    borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "grab",
                                    ...provided.draggableProps.style }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1B2E4B" }}>{ind.nomeCompleto || ind.nome}</div>
                                    <button onClick={() => handleDelete(ind._firebaseId)}
                                      style={{ background: "transparent", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16 }}>×</button>
                                  </div>
                                  <div style={{ color: "#888", fontSize: 11 }}>{ind.telefone} · {ind.tipo}</div>
                                  {ind.motivoCancelamento && <div style={{ background: "#FFF5F5",
                                    border: "1px solid #FFCDD2", borderRadius: 6, padding: "6px 8px",
                                    color: "#C62828", fontSize: 10, marginTop: 6 }}>Motivo: {ind.motivoCancelamento}</div>}
                                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                    <div style={{ color: "#4CAF50", fontSize: 10, fontWeight: 700 }}>{nomes[ind.parceiro]||p?.name}</div>
                                    <div style={{ color: "#bbb", fontSize: 10 }}>{new Date(ind.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>
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
                  <h2 style={{ fontWeight: 800, fontSize: 18, color: "#1B2E4B" }}>Nomes dos Parceiros</h2>
                  {!editingNames
                    ? <button onClick={() => setEditNomes(true)} style={{ background: "#F5F7FA",
                        border: "1px solid #E0E7E0", color: "#666", borderRadius: 8,
                        padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Editar</button>
                    : <button onClick={handleSaveNomes} style={{ background: "#4CAF50", border: "none",
                        color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13,
                        cursor: "pointer", fontWeight: 700 }}>Salvar</button>}
                </div>
                {PARTNERS.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4CAF50", flexShrink: 0 }} />
                    {editingNames
                      ? <input value={nomes[p.id]||""} onChange={e => setNomes(prev => ({ ...prev, [p.id]: e.target.value }))}
                          style={{ background: "#F5F7FA", border: "1px solid #E0E7E0", borderRadius: 8,
                          padding: "10px 14px", color: "#1B2E4B", fontSize: 14, flex: 1, outline: "none" }} />
                      : <span style={{ fontSize: 15, fontWeight: 600, color: "#1B2E4B" }}>{nomes[p.id]||p.name}</span>}
                  </div>
                ))}
              </div>
              <div style={{ ...card, padding: 28 }}>
                <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#1B2E4B" }}>Links dos Formularios</h2>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 22 }}>Envie para cada parceiro.</p>
                {PARTNERS.map(p => (
                  <div key={p.id} style={{ background: "#F5F7FA", border: "1px solid #E0E7E0",
                    borderRadius: 12, padding: "16px 20px", marginBottom: 12,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4, color: "#1B2E4B" }}>{nomes[p.id]||p.name}</div>
                      <div style={{ color: "#4CAF50", fontSize: 12, fontFamily: "monospace" }}>
                        {typeof window !== "undefined" ? window.location.origin : ""}/form/{p.id}</div>
                    </div>
                    <button onClick={() => copyLink(p.id)} style={{
                      background: copied===p.id ? "#F0F9F0" : "#fff",
                      border: "1px solid " + (copied===p.id ? "#C8E6C9" : "#E0E7E0"),
                      color: copied===p.id ? "#2E7D32" : "#1B2E4B",
                      borderRadius: 8, padding: "8px 18px", fontSize: 13,
                      cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
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
