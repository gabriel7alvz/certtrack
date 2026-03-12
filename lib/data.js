import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
export const PARTNERS = [
  { id: "rafamaceno", name: "Rafa Maceno", color: "#00C896" },
  { id: "parceiro2", name: "Parceiro 2", color: "#FF6B35" },
];

export const USERS = [
  { email: "admin@certificapro", password: "Cert@2026#", role: "admin" },
  { email: "admin@rafamaceno", password: "Rafa@2026#", role: "parceiro", parceiro: "rafamaceno" },
];

const KEY = "certtrack_data";
const SESSION_KEY = "certtrack_session";

export function loadData() {
  if (typeof window === "undefined") return { indicacoes: [], nomes: {} };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { indicacoes: [], nomes: {} };
  } catch { return { indicacoes: [], nomes: {} }; }
}

export async function saveData(data) {
  if (typeof window === "undefined") return;

  // continua salvando no navegador
  localStorage.setItem(KEY, JSON.stringify(data));

  // salva também no Firebase
  try {
    if (data.indicacoes) {
      const ultima = data.indicacoes[data.indicacoes.length - 1];

      if (ultima) {
        await addDoc(collection(db, "indicacoes"), ultima);
        console.log("Indicação salva no Firebase");
      }
    }
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
  }
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(user) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(m) {
  const [y, mo] = m.split("-");
  return new Date(y, mo - 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export const STATUS_COLORS = {
  "Aguardando": "#FFB800",
  "Em andamento": "#4A9EFF",
  "Concluido": "#00C896",
  "Cancelado": "#FF4D4D",
};
