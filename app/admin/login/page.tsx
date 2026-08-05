"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginError("");

    try {
      const { data, error } = await supabase
        .from("corretores")
        .select("*")
        .or(`email.eq.${inputEmail},creci.eq.${inputEmail}`);

      if (error || !data || data.length === 0) {
        setLoginError("E-mail ou CRECI não encontrado.");
        setLoadingLogin(false);
        return;
      }

      const corretor = data[0];
      const senhaCorreta = corretor.senha || "esfinge2026";

      if (inputPassword === senhaCorreta || inputPassword === "esfinge2026") {
        window.location.href = "/admin";
      } else {
        setLoginError("Senha incorreta. Tente novamente.");
      }
    } catch (err) {
      setLoginError("Erro ao validar login. Verifique sua conexão.");
    } finally {
      setLoadingLogin(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto text-xl mb-3 font-bold shadow-md">
            🔒
          </div>
          <h2 className="text-xl font-black text-slate-900">Portal do Corretor</h2>
          <p className="text-xs text-slate-500 mt-1">Esfinge | Guardião de Imóveis</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">E-MAIL OU CRECI</label>
            <input
              type="text"
              placeholder="Ex: carlos@esfingeimoveis.com.br"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              required
              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl outline-none focus:border-amber-500 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">SENHA DE ACESSO</label>
            <input
              type="password"
              placeholder="Sua senha..."
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              required
              className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl outline-none focus:border-amber-500 text-sm text-slate-900"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Senha padrão: <strong>esfinge2026</strong>
            </span>
          </div>
          {loginError && <p className="text-xs font-bold text-rose-500">{loginError}</p>}
          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition text-sm shadow"
          >
            {loadingLogin ? "Verificando..." : "Entrar no Painel"}
          </button>
        </form>
        <a href="/" className="block text-center text-xs text-slate-500 hover:text-amber-600 underline">
          ← Voltar para a Vitrine Pública
        </a>
      </div>
    </div>
  );
}