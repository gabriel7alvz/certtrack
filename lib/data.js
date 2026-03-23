import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";

export const PARTNERS = [
  { id: "rafamaceno", name: "Rafa Maceno", color: "#00C896" },
  { id: "parceiro2", name: "Parceiro 2", color: "#FF6B35" },
]; 

export const USERS = [
  { email: "admin@certificapro", password: "Cert@2026#", role: "admin" },
  { email: "admin@rafamaceno", password: "Rafa@2026#", role: "parceiro", parceiro: "rafamaceno" },
];

const SESSION_KEY = "certtrack_session";

export async function loadData() {
  try {
    const [indicacoesSnap, configSnap] = await Promise.all([
      getDocs(collection(db, "indicacoes")),
      getDoc(doc(db, "config", "nomes")),
    ]);
    const indicacoes = indicacoesSnap.docs.map((d) => ({ ...d.data(), _firebaseId: d.id }));
    const nomes = configSnap.exists() ? configSnap.data() : {};
    return { indicacoes, nomes };
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
    return { indicacoes: [], nomes: {} };
  }
}

export async function saveIndicacao(ind) {
  try {
    const docRef = await addDoc(collection(db, "indicacoes"), ind);
    return { ...ind, _firebaseId: docRef.id };
  } catch (e) {
    console.error("Erro ao salvar indicacao:", e);
  }
}

export async function updateStatus(firebaseId, status, extra = {}) {
  try {
    await updateDoc(doc(db, "indicacoes", firebaseId), { status, ...extra });
  } catch (e) {
    console.error("Erro ao atualizar status:", e);
  }
}

export async function deleteIndicacao(firebaseId) {
  try {
    await deleteDoc(doc(db, "indicacoes", firebaseId));
  } catch (e) {
    console.error("Erro ao deletar indicacao:", e);
  }
}

export async function saveNomes(nomes) {
  try {
    await setDoc(doc(db, "config", "nomes"), nomes);
  } catch (e) {
    console.error("Erro ao salvar nomes:", e);
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
