"use client";
import { useState } from "react";

export default function RegisterUser() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/tasks/[id]", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, type: "Register" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Erro ao fazer Registro");
        return;
      }

      const data = await response.json();
      console.log("Registro bem-sucedido:", data);

      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao realizar Registro:", error);
      setError("Erro ao conectar com o servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-6">Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              className="w-full p-2 border rounded-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Register
          </button>
          <div className="mb-4 flex items-center space-x-1 text-sm justify-center">
            <p className="inline"> Already have an account? Login</p>{" "}
            <a
              href="http://localhost:3000/login"
              className="inline text-blue-500 hover:underline"
            >
              {" "}
              here{" "}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
