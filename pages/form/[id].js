import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { PARTNERS, loadData, saveData, currentMonth } from "../../lib/data";

const BOTSEND_URL = "https://api.botsend.com.br/api/message/99c9217f-eb2d-4683-8204-4cbcae166c24/v2";
const BOTSEND_TOKEN = "019ce3c9-5ded-72f6-b57c-022b6bf66752";
const NOTIFY_NUMBER = "5518996676744";

async function notificar(ind, parceiroNome) {
  const texto = `Nova Indicacao Recebida!\n\nNome: ${ind.nomeCompleto}\nContato: ${ind.telefone}\nTipo: ${ind.tipo}${ind.cpf ? `\nCPF: ${ind.cpf}` : ""}${ind.cnpj ? `\nCNPJ: ${ind.cnpj}` : ""}${ind.razaoSocial ? `\nRazao Social: ${ind.razaoSocial}` : ""}${ind.obs ? `\nObs: ${ind.obs}` : ""}\n\nParceiro: ${parceiroNome}`;
  await fetch(BOTSEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${BOTSEND_TOKEN}` },
    body: JSON.stringify({ cellphone: NOTIFY_NUMBER, message: texto, options: [{ id: "em_andamento", label: "Em andamento", callback: "https://certtrack.vercel.app" }, { id: "concluido", label: "Concluido", callback: "https://certtrack.vercel.app" }] }),
  });
}

export default function FormPage() {
  const router = useRouter();
  const { id } = router.query;
  const partner = PARTNERS.find((p) => p.id === id);
  const [tipo, setTipo] = useState("A1 PF");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [obs, setObs] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!partner) return (<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#555" }}>Link invalido.</p></div>);

  const c = partner.color;
  const isPJ = tipo === "A1 PJ";
  const allFilled = nomeCompleto.trim() && telefone.trim() && cpf.trim() && (!isPJ || (razaoSocial.trim() && cnpj.trim()));

  const submit = async () => {
    if (!allFilled) return;
    setLoading(true);
    const data = loadData();
    const parceiroNome = data.nomes?.[partner.id] || partner.name;
    const ind = { id: Date.now(), parceiro: partner.id, tipo, nomeCompleto: nomeCompleto.trim(), cpf: cpf.trim(), razaoSocial: isPJ ? razaoSocial.trim() : "", cnpj: isPJ ? cnpj.trim() : "", telefone: telefone.trim(), obs: obs.trim(), mes: currentMonth(), data: new Date().toISOString(), status: "Aguardando" };
    data.indicacoes.push(ind);
    saveData(data);
    try { await notificar(ind, parceiroNome); } catch (e) { console.error(e); }
    setNomeCompleto(""); setCpf(""); setRazaoSocial(""); setCnpj(""); setTelefone(""); setObs(""); setTipo("A1 PF");
    setSuccess(true); setLoading(false);
    setTimeout(() => setSuccess(false), 4000);
  };

  const inp = { width: "100%", background: "#0C0C14", border: "1px solid #25253A", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" };
  const lbl = (text, optional) => (<label style={{ display: "block", color: "#888", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{text} {optional && <span style={{ color: "#444", fontWeight: 400 }}>(opcional)</span>}</label>);

  return (
    <>
      <Head><title>Indicar Cliente</title></Head>
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Syne', sans-serif" }}>
        <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: `radial-gradient(ellipse, ${c}18 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
        <div className="fadeUp" style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: c + "15", border: `1px solid ${c}35`, borderRadius: 100, padding: "7px 18px", marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} />
              <span style={{ color: c, fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>{(loadData().nomes?.[partner.id] || partner.name).toUpperCase()}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Indicar Cliente</h1>
            <p style={{ color: "#555", fontSize: 14, marginTop: 6 }}>Certificado Digital - Preencha os dados do indicado</p>
          </div>
          <div style={{ background: "#10101A", border: "1px solid #1E1E2E", borderRadius: 20, padding: "30px 28px" }}>
            <div style={{ marginBottom: 24 }}>
              {lbl("TIPO DE CERTIFICADO")}
              <div style={{ display: "flex", gap: 10 }}>
                {["A1 PF", "A1 PJ"].map((t) => (
                  <button key={t} onClick={() => setTipo(t)} style={{ flex: 1, padding: "13px 0", borderRadius: 10, border: "1px solid", borderColor: tipo === t ? c : "#25253A", background: tipo === t ? c + "18" : "transparent", color: tipo === t ? c : "#555", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                    {t}<div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, color: tipo === t ? c + "cc" : "#444" }}>{t === "A1 PF" ? "Pessoa Fisica" : "Pessoa Juridica"}</div>
                  </button>
                ))}
              </div>
            </div>
            {isPJ && (<><div style={{ marginBottom: 18 }}>{lbl("RAZAO SOCIAL")}<input type="text" value={razaoSocial} placeholder="Ex: Empresa LTDA" onChange={(e) => setRazaoSocial(e.target.value)} style={inp} onFocus={(e) => (e.target.style.borderColor = c)} onBlur={(e) => (e.target.style.borderColor = "#25253A")} /></div><div style={{ marginBottom: 18 }}>{lbl("CNPJ")}<input type="text" value={cnpj} placeholder="00.000.000/0000-00" onChange={(e) => setCnpj(e.target.value)} style={inp} onFocus={(e) => (e.target.style.borderColor = c)} onBlur={(e) => (e.target.style.borderColor = "#25253A")} /></div></>)}
            <div style={{ marginBottom: 18 }}>{lbl("NOME COMPLETO")}<input type="text" value={nomeCompleto} placeholder="Ex: Maria da Silva" onChange={(e) => setNomeCompleto(e.target.value)} style={inp} onFocus={(e) => (e.target.style.borderColor = c)} onBlur={(e) => (e.target.style.borderColor = "#25253A")} /></div>
            <div style={{ marginBottom: 18 }}>{lbl("CPF")}<input type="text" value={cpf} placeholder="000.000.000-00" onChange={(e) => setCpf(e.target.value)} style={inp} onFocus={(e) => (e.target.style.borderColor = c)} onBlur={(e) => (e.target.style.borderColor = "#25253A")} /></div>
            <div style={{ marginBottom: 18 }}>{lbl("NUMERO PARA CONTATO")}<input type="tel" value={telefone} placeholder="(11) 99999-9999" onChange={(e) => setTelefone(e.target.value)} style={inp} onFocus={(e) => (e.target.style.borderColor = c)} onBlur={(e) => (e.target.style.borderColor = "#25253A")} /></div>
            <div style={{ marginBottom: 28 }}>{lbl("OBSERVACOES", true)}<textarea rows={3} value={obs} placeholder="Alguma info adicional..." onChange={(e) => setObs(e.target.value)} style={{ ...inp, resize: "vertical" }} onFocus={(e) => (e.target.style.borderColor = c)} onBlur={(e) => (e.target.style.borderColor = "#25253A")} /></div><button onClick={submit} disabled={loading || !allFilled} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: c, color: "#fff", fontSize: 15, fontWeight: 700, cursor: allFilled ? "pointer" : "not-allowed", letterSpacing: 0.5, transition: "opacity 0.2s", opacity: !allFilled ? 0.4 : 1 }}>
              {loading ? "Enviando..." : "Registrar Indicacao ->"}
            </button>
            {success && (
              <div style={{ marginTop: 14, background: "#00C89618", border: "1px solid #00C89635", borderRadius: 10, padding: "13px 16px", color: "#00C896", textAlign: "center", fontSize: 14, fontWeight: 600 }}>
                Indicacao registrada com sucesso!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
