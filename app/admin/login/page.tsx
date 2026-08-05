"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Login tradicional por E-mail e Senha
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Erro ao fazer login: " + error.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  // Login via Google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) setErrorMsg("Erro no login com Google: " + error.message);
  };

  // Login via Gov.br (Provedor OIDC customizado do Supabase)
  const handleGovLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "keycloak", // O Gov.br é comumente integrado via OIDC/Keycloak no Supabase
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) setErrorMsg("Conexão Gov.br não configurada no Supabase ainda.");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Topo / Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Área Restrita</h1>
          <p className="text-sm text-slate-500 mt-1">
            Acesso exclusivo para corretores e equipe
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {/* Botões Social Login / Gov.br */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGovLogin}
            type="button"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition border border-blue-900 shadow-sm"
          >
            🏛️ Entrar com <strong>gov.br</strong>
          </button>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition border border-slate-200"
          >
            🔍 Entrar com Google
          </button>
        </div>

        {/* Divisor */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-xs text-slate-400 font-medium absolute">
            ou acesse por e-mail
          </span>
        </div>

        {/* Formulário E-mail / Senha */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="corretor@imobiliaria.com.br"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-md disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Entrar no Painel"}
          </button>
        </form>
      </div>
    </div>
  );
}