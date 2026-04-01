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

export default function Admin() {
  const router = useRouter();
  const [data, setData] = useState({ indicacoes: [], nomes: {} });
  const [mes, setMes] = useState(currentMonth());
  const [tab, setTab] = useState("kanban");
  const [nomes, setNomes] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.push("/login");
      return;
    }

    loadData().then(d => {
      setData(d);
      if (d.nomes) setNomes(d.nomes);
      setReady(true);
    });
  }, []);

  // 🔥 FUNÇÃO UNIVERSAL DE DATA (firebase + string)
  const getDate = (item) => {
    if (!item || !item.data) return null;

    if (typeof item.data === "object" && item.data.seconds) {
      return new Date(item.data.seconds * 1000);
    }

    return new Date(item.data);
  };

  // ✅ FILTRO POR MÊS CORRIGIDO (YYYY-MM)
  const filtradas = data.indicacoes.filter(i => {
    const d = getDate(i);
    if (!d) return false;

    const ano = d.getFullYear();
    const mesItem = String(d.getMonth() + 1).padStart(2, "0");

    return `${ano}-${mesItem}` === mes;
  });

  const canceladas = filtradas.filter(i => i.status === "Cancelado");

  // ✅ LISTA DE MESES BASEADA NA DATA REAL
  const meses = [
    ...new Set(
      data.indicacoes.map(i => {
        const d = getDate(i);
        if (!d) return null;

        const ano = d.getFullYear();
        const mesItem = String(d.getMonth() + 1).padStart(2, "0");

        return `${ano}-${mesItem}`;
      }).filter(Boolean)
    )
  ].sort().reverse();

  const card = {
    background: "#fff",
    border: "1px solid #E0E7E0",
    borderRadius: 18,
    boxShadow: "0 1px 4px #1B2E4B0A"
  };

  if (!ready) return <div style={{ padding: 40 }}>Carregando...</div>;

  return (
    <>
      <Head><title>CertificaPro - Admin</title></Head>

      <div style={{ padding: 20 }}>
        <select value={mes} onChange={e => setMes(e.target.value)}>
          {meses.map(m => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </div>

      <DragDropContext onDragEnd={() => {}}>
        <div style={{ display: "flex", gap: 12, padding: 20 }}>
          {COLUNAS.map(col => {
            const cards = filtradas.filter(i => i.status === col.id);

            return (
              <div key={col.id} style={{ width: 260 }}>
                <h4>{col.label} ({cards.length})</h4>

                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {cards.map((ind, index) => (
                        <Draggable key={ind._firebaseId} draggableId={ind._firebaseId} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                padding: 10,
                                border: "1px solid #ddd",
                                borderRadius: 10,
                                marginBottom: 8,
                                background: "#fff",
                                ...provided.draggableProps.style
                              }}
                            >
                              <strong>{ind.nome || ind.nomeCompleto}</strong>
                              <div style={{ fontSize: 12 }}>{ind.telefone}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}

          <div style={{ width: 260 }}>
            <h4>Cancelado ({canceladas.length})</h4>
          </div>
        </div>
      </DragDropContext>
    </>
  );
}
