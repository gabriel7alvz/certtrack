import { db, collection, addDoc, getDocs } from "./firebase";

export async function salvarIndicacao(dados) {
  try {
    await addDoc(collection(db, "indicacoes"), dados);
    console.log("Indicação salva no Firebase");
  } catch (e) {
    console.error("Erro ao salvar:", e);
  }
}

export async function buscarIndicacoes() {
  const querySnapshot = await getDocs(collection(db, "indicacoes"));

  const lista = [];

  querySnapshot.forEach((doc) => {
    lista.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return lista;
}
