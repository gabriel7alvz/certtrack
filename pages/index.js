import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PARTNERS, loadData, updateStatus, deleteIndicacao, saveNomes, currentMonth, monthLabel, getSession, clearSession } from "../lib/data";

const COLUNAS = [
  { id: "Aguardando", label: "Aguardando" },
  { id: "Em contato", label: "Em contato" },
  { id: "Aguardando informacoes", label: "Aguard. Informacoes" },
  { id: "Agendado", label: "Agendado" },
  { id: "Certificado emitido", label: "Cert. Emitido" },
];

export default function Admin() {
  const router = useRouter();
  const [data, setData] = useState({ indicacoes: [], nomes: {} });
  const [mes, setMes] = useState(currentMonth());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.push("/login");
      return;
    }

    loadData().then(d => {
      setData(d);
      setReady(true);
    });
  }, []);

  // 🔥 FUNÇÃO PRA PEGAR DATA SEGURA
  const getDate = (item) => {
    if (!item || !item.data) return null;

    if (typeof item.data === "object" && item.data.seconds) {
      return new Date(item.data.seconds * 1000);
    }

    return new Date(item.data);
  };

  // 🔥 GERAR LABEL (ex: "março de 2026")
  const getLabel = (date) => {
    const meses = [
      "janeiro","fevereiro","março","abril","maio","junho",
      "julho","agosto","setembro","outubro","novembro","dezembro"
    ];

    return `${meses[date.getMonth()]} de ${date.getFullYear()}`;
  };

  // ✅ FILTRO CORRETO
  const filtradas = data.indicacoes.filter(i => {
    const d = getDate(i);
    if (!d) return false;

    return getLabel(d) === mes.toLowerCase();
  });

  const canceladas = filtradas.filter(i => i.status === "Cancelado");

  // ✅ MESES DINÂMICOS
  const meses = [
    ...new Set(
      data.indicacoes
        .map(i => {
          const d = getDate(i);
          return d ? getLabel(d) : null;
        })
        .filter(Boolean)
    )
  ].sort((a, b) => {
    const mesesNomes = [
      "janeiro","fevereiro","março","abril","maio","junho",
      "julho","agosto","setembro","outubro","novembro","dezembro"
    ];

    const [mesA, anoA] = a.split(" de ");
    const [mesB, anoB] = b.split(" de ");

    return new Date(anoB, mesesNomes.indexOf(mesB)) -
           new Date(anoA, mesesNomes.indexOf(mesA));
  });

  if (!ready) return <div>Carregando...</div>;

  return (
    <>
      <Head><title>Admin</title></Head>

      <select value={mes} onChange={e => setMes(e.target.value)}>
        {meses.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <DragDropContext onDragEnd={() => {}}>
        <div style={{ display: "flex", gap: 10 }}>
          {COLUNAS.map(col => {
            const cards = filtradas.filter(i => i.status === col.id);

            return (
              <div key={col.id} style={{ width: 250 }}>
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
                              style={{ padding: 10, border: "1px solid #ccc", marginBottom: 8 }}
                            >
                              {ind.nome || ind.nomeCompleto}
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

          <div>
            <h4>Cancelado ({canceladas.length})</h4>
          </div>
        </div>
      </DragDropContext>
    </>
  );
}
