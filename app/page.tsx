"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export interface Corretor {
  id: number | string;
  nome: string;
  creci: string;
  telefone: string;
  email: string;
  senha?: string;
}

export interface Imovel {
  id: number | string;
  codigo: string;
  titulo: string;
  tipo: string;
  modalidade: string;
  cidade: string;
  bairro: string;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  area_util: number;
  aceita_pet: boolean;
  ar_condicionado: boolean;
  imagens: string[];
  corretor_id: number | string;
  status: string;
}

const ADMIN_PASSWORD_DEFAULT = "esfinge2026";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [corretorLogado, setCorretorLogado] = useState<Corretor | null>(null);
  
  const [inputEmail, setInputEmail] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [loadingLogin, setLoadingLogin] = useState<boolean>(false);

  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [formImovel, setFormImovel] = useState({
    codigo: "ESF-" + Math.floor(100 + Math.random() * 900),
    titulo: "",
    tipo: "Casa",
    modalidade: "Venda",
    cidade: "Maringá",
    bairro: "",
    preco: "",
    quartos: "3",
    banheiros: "2",
    vagas: "2",
    areaUtil: "",
    aceitaPet: true,
    arCondicionado: true,
    corretorId: "",
    imagemUrl: ""
  });

  const [formCorretor, setFormCorretor] = useState({
    nome: "",
    creci: "",
    telefone: "",
    email: "",
    senha: "123"
  });

  const [importUrl, setImportUrl] = useState<string>("");
  const [importing, setImporting] = useState<boolean>(false);

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    setLoading(true);
    try {
      const { data: dataCorretor } = await supabase.from("corretores").select("*");
      if (dataCorretor && dataCorretor.length > 0) {
        setCorretores(dataCorretor);
        if (!formImovel.corretorId) {
          setFormImovel(prev => ({ ...prev, corretorId: String(dataCorretor[0].id) }));
        }
      }

      const { data: dataImovel } = await supabase.from("imoveis").select("*");
      if (dataImovel) {
        setImoveis(dataImovel);
      }
    } catch (e) {
      console.error("Erro ao buscar dados do Supabase:", e);
    } finally {
      setLoading(false);
    }
  }

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

      const corretor = data[0] as Corretor;
      const senhaCorreta = corretor.senha || ADMIN_PASSWORD_DEFAULT;

      if (inputPassword === senhaCorreta || inputPassword === ADMIN_PASSWORD_DEFAULT) {
        setIsAuthenticated(true);
        setCorretorLogado(corretor);
      } else {
        setLoginError("Senha incorreta. Tente novamente.");
      }
    } catch (err) {
      setLoginError("Erro ao validar login. Verifique sua conexão.");
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleCadastrarImovel(e: React.FormEvent) {
    e.preventDefault();
    if (!formImovel.titulo || !formImovel.preco || !formImovel.bairro) {
      return;
    }

    const novoImovel = {
      codigo: formImovel.codigo,
      titulo: formImovel.titulo,
      tipo: formImovel.tipo,
      modalidade: formImovel.modalidade,
      cidade: formImovel.cidade,
      bairro: formImovel.bairro,
      preco: Number(formImovel.preco),
      quartos: Number(formImovel.quartos),
      banheiros: Number(formImovel.banheiros),
      vagas: Number(formImovel.vagas),
      area_util: Number(formImovel.areaUtil || 100),
      aceita_pet: formImovel.aceitaPet,
      ar_condicionado: formImovel.arCondicionado,
      imagens: formImovel.imagemUrl ? [formImovel.imagemUrl] : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
      corretor_id: Number(formImovel.corretorId || corretorLogado?.id || 1),
      status: "Disponível"
    };

    const { error } = await supabase.from("imoveis").insert([novoImovel]);
    if (error) {
      console.error("Erro ao cadastrar imóvel:", error.message);
    } else {
      setFormImovel({
        codigo: "ESF-" + Math.floor(100 + Math.random() * 900),
        titulo: "",
        tipo: "Casa",
        modalidade: "Venda",
        cidade: "Maringá",
        bairro: "",
        preco: "",
        quartos: "3",
        banheiros: "2",
        vagas: "2",
        areaUtil: "",
        aceitaPet: true,
        arCondicionado: true,
        corretorId: String(corretorLogado?.id || corretores[0]?.id || 1),
        imagemUrl: ""
      });
      fetchDados();
    }
  }

  async function handleCadastrarCorretor(e: React.FormEvent) {
    e.preventDefault();
    if (!formCorretor.nome || !formCorretor.creci || !formCorretor.telefone) return;

    const novoC = {
      nome: formCorretor.nome,
      creci: formCorretor.creci,
      telefone: formCorretor.telefone,
      email: formCorretor.email || formCorretor.nome.toLowerCase().replace(/\s+/g, '') + "@esfingeimoveis.com.br",
      senha: formCorretor.senha || "123456"
    };

    const { error } = await supabase.from("corretores").insert([novoC]);
    if (error) {
      console.error("Erro ao cadastrar corretor:", error.message);
    } else {
      setFormCorretor({ nome: "", creci: "", telefone: "", email: "", senha: "123" });
      fetchDados();
    }
  }

  async function handleExcluirImovel(id: number | string) {
    const { error } = await supabase.from("imoveis").delete().eq("id", id);
    if (!error) {
      fetchDados();
    }
  }

  async function handleImportarLink(e: React.FormEvent) {
    e.preventDefault();
    if (!importUrl) return;
    setImporting(true);
    try {
      const res = await fetch("/api/import-imovel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl })
      });
      const data = await res.json();
      if (!data.error) {
        setFormImovel(prev => ({
          ...prev,
          titulo: data.titulo || prev.titulo,
          preco: data.preco ? String(data.preco) : prev.preco,
          imagemUrl: data.imagem || prev.imagemUrl
        }));
      }
    } catch (err) {
      console.error("Erro ao importar link");
    } finally {
      setImporting(false);
    }
  }

  if (!isAuthenticated) {
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-wrap gap-4">
          <div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Painel Administrativo • Olá, {corretorLogado?.nome || "Corretor"}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Esfinge | Gestão de Imóveis</h1>
            <p className="text-xs text-slate-500">Cadastre imóveis, importe por link e gerencie corretores</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => { setIsAuthenticated(false); setCorretorLogado(null); }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2.5 rounded-full transition border border-rose-200"
            >
              Sair da Conta
            </button>
            <a
              href="/"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-full transition shadow"
            >
              ← Ir para a Vitrine
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg space-y-3">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <span>⚡ Importador Inteligente de Imóvel por Link</span>
          </h3>
          <p className="text-xs text-slate-300">
            Cole o link de um anúncio imobiliário para preencher automaticamente os dados abaixo:
          </p>
          <form onSubmit={handleImportarLink} className="flex gap-2 flex-col sm:flex-row">
            <input
              type="url"
              placeholder="https://exemplo.com.br/imovel/123"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={importing}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs transition whitespace-nowrap shadow"
            >
              {importing ? "Importando..." : "Importar Dados"}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b pb-3">Cadastrar Novo Imóvel</h3>
              <form onSubmit={handleCadastrarImovel} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CÓDIGO / REF</label>
                  <input
                    type="text"
                    value={formImovel.codigo}
                    onChange={(e) => setFormImovel({ ...formImovel, codigo: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">TÍTULO DO IMÓVEL</label>
                  <input
                    type="text"
                    placeholder="Ex: Sobrado de Alto Padrão..."
                    value={formImovel.titulo}
                    onChange={(e) => setFormImovel({ ...formImovel, titulo: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">TIPO</label>
                    <select
                      value={formImovel.tipo}
                      onChange={(e) => setFormImovel({ ...formImovel, tipo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                    >
                      <option value="Casa">Casa</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Sobrado">Sobrado</option>
                      <option value="Studio">Studio</option>
                      <option value="Chácara">Chácara</option>
                      <option value="Comercial">Comercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">MODALIDADE</label>
                    <select
                      value={formImovel.modalidade}
                      onChange={(e) => setFormImovel({ ...formImovel, modalidade: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 font-bold text-amber-600"
                    >
                      <option value="Venda">Venda</option>
                      <option value="Aluguel">Aluguel</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CIDADE</label>
                    <input
                      type="text"
                      value={formImovel.cidade}
                      onChange={(e) => setFormImovel({ ...formImovel, cidade: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">BAIRRO / REGIÃO</label>
                    <input
                      type="text"
                      placeholder="Ex: Zona 03"
                      value={formImovel.bairro}
                      onChange={(e) => setFormImovel({ ...formImovel, bairro: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">VALOR (R$)</label>
                    <input
                      type="number"
                      placeholder="Ex: 850000"
                      value={formImovel.preco}
                      onChange={(e) => setFormImovel({ ...formImovel, preco: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ÁREA ÚTIL (m²)</label>
                    <input
                      type="number"
                      placeholder="Ex: 180"
                      value={formImovel.areaUtil}
                      onChange={(e) => setFormImovel({ ...formImovel, areaUtil: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">QUARTOS</label>
                    <input
                      type="number"
                      value={formImovel.quartos}
                      onChange={(e) => setFormImovel({ ...formImovel, quartos: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">BANHEIROS</label>
                    <input
                      type="number"
                      value={formImovel.banheiros}
                      onChange={(e) => setFormImovel({ ...formImovel, banheiros: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">VAGAS</label>
                    <input
                      type="number"
                      value={formImovel.vagas}
                      onChange={(e) => setFormImovel({ ...formImovel, vagas: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center outline-none text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">URL DA FOTO PRINCIPAL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImovel.imagemUrl}
                    onChange={(e) => setFormImovel({ ...formImovel, imagemUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CORRETOR RESPONSÁVEL</label>
                  <select
                    value={formImovel.corretorId}
                    onChange={(e) => setFormImovel({ ...formImovel, corretorId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 font-medium text-slate-900"
                  >
                    {corretores.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} (CRECI: {c.creci})</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formImovel.aceitaPet}
                      onChange={(e) => setFormImovel({ ...formImovel, aceitaPet: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>🐾 Pet Friendly</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formImovel.arCondicionado}
                      onChange={(e) => setFormImovel({ ...formImovel, arCondicionado: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>❄️ Ar-Condicionado</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black p-3 rounded-xl text-xs transition shadow-md mt-2"
                >
                  Publicar Imóvel na Vitrine
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b pb-3">Novo Corretor</h3>
              <form onSubmit={handleCadastrarCorretor} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome Completo *"
                  value={formCorretor.nome}
                  onChange={(e) => setFormCorretor({ ...formCorretor, nome: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                />
                <input
                  type="text"
                  placeholder="CRECI (Ex: PR-45920) *"
                  value={formCorretor.creci}
                  onChange={(e) => setFormCorretor({ ...formCorretor, creci: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Telefone / WhatsApp *"
                  value={formCorretor.telefone}
                  onChange={(e) => setFormCorretor({ ...formCorretor, telefone: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                />
                <input
                  type="password"
                  placeholder="Senha de Acesso *"
                  value={formCorretor.senha}
                  onChange={(e) => setFormCorretor({ ...formCorretor, senha: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900"
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl text-xs transition"
                >
                  Cadastrar Corretor
                </button>
              </form>
              <div className="pt-3 border-t space-y-2">
                <h4 className="font-bold text-[11px] text-slate-400 uppercase">Equipe Registrada</h4>
                {corretores.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between items-center border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-800">{c.nome}</div>
                      <div className="text-slate-400 text-[10px]">CRECI: {c.creci}</div>
                    </div>
                    <div className="text-amber-600 font-bold">{c.telefone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-slate-900 text-base">
                Imóveis Cadastrados ({imoveis.length})
              </h3>
              <button
                onClick={fetchDados}
                className="text-xs text-amber-600 font-bold hover:underline"
              >
                🔄 Atualizar Lista
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Carregando imóveis do Supabase...</div>
            ) : imoveis.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Nenhum imóvel cadastrado no banco de dados ainda.</p>
                <p className="text-[11px] text-slate-400 mt-1">Utilize o formulário ao lado para cadastrar o primeiro.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {imoveis.map((imv) => {
                  const corr = corretores.find(c => String(c.id) === String(imv.corretor_id));
                  return (
                    <div
                      key={imv.id}
                      className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={imv.imagens && imv.imagens[0] ? imv.imagens[0] : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80"}
                          alt={imv.titulo}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              {imv.codigo}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded text-white ${imv.modalidade === 'Venda' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                              {imv.modalidade}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{imv.titulo}</h4>
                          <p className="text-xs text-slate-500">
                            📍 {imv.bairro}, {imv.cidade} • <strong className="text-slate-800">R$ {Number(imv.preco).toLocaleString('pt-BR')}</strong>
                          </p>
                          {corr && (
                            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                              Corretor: {corr.nome}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => handleExcluirImovel(imv.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition border border-rose-200"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}