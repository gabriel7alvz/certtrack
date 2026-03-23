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
];

const STATUS_COLORS = {
  "Aguardando": "#FFB800",
  "Em contato": "#4A9EFF",
  "Aguardando informacoes": "#A78BFA",
  "Agendado": "#F97316",
  "Certificado emitido": "#00C896",
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
