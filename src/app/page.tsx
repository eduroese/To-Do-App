import Image from "next/image";
import connectToDatabase from "../db/db";

export default async function Home() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }

  return (
    <h1 className="mb-2 text-2xl text-center align-top italic">
            To do App by{" "}
            <code className="dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              Eduardo Roese
            </code>
            .
          </h1>
  );
}
