import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export async function testarFirebase() {
  try {
    const docRef = await addDoc(collection(db, "teste"), {
      nome: "primeiro teste",
      data: new Date()
    });

    console.log("Documento criado:", docRef.id);
  } catch (e) {
    console.error("Erro ao criar documento:", e);
  }
}
