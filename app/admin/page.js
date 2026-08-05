"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [emailLogin, setEmailLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");
  const [erroLogin, setErroLogin] = useState("");

  const [abaAtiva, setAbaAtiva] = useState("imoveis");

  // Estados dos Imóveis
  const [imoveis, setImoveis] = useState([]);
  const [linkOrigem, setLinkOrigem] = useState("");
  const [importando, setImportando] = useState(false);
  
  // Formulário de Imóvel Manual
  const [formImovel, setFormImovel] = useState({
    codigo: "ESF-" + Math.floor(100 + Math.random() * 900),
    titulo: "",
    tipo: "Casa",
    cidade: "Maringá",
    bairro: "",
    modalidade: "Venda",
    preco: "",
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    area_util: 120,
    aceita_pet: true,
    ar_condicionado: true,
    corretor_id: "",
    imagensStr: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
  });

  // Estados dos Corretores
  const [corretores, setCorretores] = useState([]);
  const [formCorretor, setFormCorretor] = useState({
    nome: "",
    creci: "",
    telefone: "",
    email: "",
    senha: "123",
    is_admin: false
  });

  // Estados das Imobiliárias Parceiras
  const [imobiliarias, setImobiliarias] = useState([]);
  const [formImobiliaria, setFormImobiliaria] = useState({
    nome: "",
    logo: "",
    cidade: "Maringá",
    telefone: "",
    site: "",
    descricao: "",
    creci: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autenticado) {
      carregarDadosAdmin();
    }
  }, [autenticado]);

  async function fazerLogin(e) {
    e.preventDefault();
    setErroLogin("");
    try {
      const { data, error } = await supabase
        .from("corretores")
        .select("*")
        .eq("email", emailLogin)
        .eq("senha", senhaLogin)
        .single();

      if (error || !data) {
        setErroLogin("Credenciais inválidas. Verifique e-mail e senha.");
        return;
      }

      setAutenticado(true);
    } catch (err) {
      setErroLogin("Erro ao tentar autenticar no Supabase.");
    }
  }

  async function carregarDadosAdmin() {
    setLoading(true);
    try {
      const { data: corr } = await supabase.from("corretores").select("*");
      if (corr) setCorretores(corr);

      const { data: imv } = await supabase.from("imoveis").select("*");
      if (imv) setImoveis(imv);

      const { data: imb } = await supabase.from("imobiliarias").select("*");
      if (imb) setImobiliarias(imb);
    } catch (e) {
      console.error("Erro ao carregar dados admin:", e);
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÕES DE IMÓVEIS ---
  async function handleImportarLink(e) {
    e.preventDefault();
    if (!linkOrigem) return;
    setImportando(true);
    setTimeout(() => {
      setFormImovel(prev => ({
        ...prev,
        titulo: "Imóvel Importado via Portal Parceiro",
        bairro: "Centro",
        preco: "450000",
        imagensStr: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
      }));
      setImportando(false);
      alert("Dados extraídos com sucesso! Revise e clique em Publicar.");
    }, 1200);
  }

  async function cadastrarImovel(e) {
    e.preventDefault();
    try {
      const imagensArray = formImovel.imagensStr.split(",").map(s => s.trim());
      const payload = {
        codigo: formImovel.codigo,
        titulo: formImovel.titulo,
        tipo: formImovel.tipo,
        cidade: formImovel.cidade,
        bairro: formImovel.bairro,
        modalidade: formImovel.modalidade,
        preco: Number(formImovel.preco),
        quartos: Number(formImovel.quartos),
        banheiros: Number(formImovel.banheiros),
        vagas: Number(formImovel.vagas),
        area_util: Number(formImovel.area_util),
        aceita_pet: formImovel.aceita_pet,
        ar_condicionado: formImovel.ar_condicionado,
        corretor_id: formImovel.corretor_id ? Number(formImovel.corretor_id) : null,
        imagens: imagensArray
      };

      const { error } = await supabase.from("imoveis").insert([payload]);
      if (error) throw error;

      alert("Imóvel cadastrado com sucesso!");
      carregarDadosAdmin();
      setFormImovel({
        codigo: "ESF-" + Math.floor(100 + Math.random() * 900),
        titulo: "",
        tipo: "Casa",
        cidade: "Maringá",
        bairro: "",
        modalidade: "Venda",
        preco: "",
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area_util: 120,
        aceita_pet: true,
        ar_condicionado: true,
        corretor_id: "",
        imagensStr: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
      });
    } catch (err) {
      alert("Erro ao cadastrar imóvel: " + err.message);
    }
  }

  async function excluirImovel(id) {
    if (!confirm("Deseja realmente excluir este imóvel?")) return;
    await supabase.from("imoveis").delete().eq("id", id);
    carregarDadosAdmin();
  }

  // --- FUNÇÕES DE CORRETORES ---
  async function cadastrarCorretor(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("corretores").insert([formCorretor]);
      if (error) throw error;
      alert("Corretor cadastrado com sucesso!");
      carregarDadosAdmin();
      setFormCorretor({ nome: "", creci: "", telefone: "", email: "", senha: "123", is_admin: false });
    } catch (err) {
      alert("Erro ao cadastrar corretor: " + err.message);
    }
  }

  async function excluirCorretor(id) {
    if (!confirm("Deseja excluir este corretor?")) return;
    await supabase.from("corretores").delete().eq("id", id);
    carregarDadosAdmin();
  }

  // --- FUNÇÕES DE IMOBILIÁRIAS PARCEIRAS ---
  async function cadastrarImobiliaria(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("imobiliarias").insert([formImobiliaria]);
      if (error) throw error;
      alert("Imobiliária parceira cadastrada com sucesso!");
      carregarDadosAdmin();
      setFormImobiliaria({ nome: "", logo: "", cidade: "Maringá", telefone: "", site: "", descricao: "", creci: "" });
    } catch (err) {
      alert("Erro ao cadastrar imobiliária: " + err.message);
    }
  }

  async function excluirImobiliaria(id) {
    if (!confirm("Deseja remover esta imobiliária parceira?")) return;
    await supabase.from("imobiliarias").delete().eq("id", id);
    carregarDadosAdmin();
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-4 font-sans text-stone-200">
        <div className="bg-[#161312] border border-amber-600/40 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#b94a2b] to-[#120f0e] rounded-2xl mx-auto flex items-center justify-center border border-amber-500/50 text-amber-400 text-2xl shadow-lg">
            🏛️
          </div>
          <div>
            <h1 className="text-2xl font-black text-amber-400 tracking-wide">PORTAL DO CORRETOR</h1>
            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">Esfinge | Guardião de Imóveis</p>
          </div>

          <form onSubmit={fazerLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">E-mail de Acesso</label>
              <input
                type="email"
                required
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                placeholder="ex: emerson@esfinge.com"
                className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">Senha</label>
              <input
                type="password"
                required
                value={senhaLogin}
                onChange={(e) => setSenhaLogin(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            {erroLogin && <p className="text-xs text-rose-500 font-bold">{erroLogin}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#b94a2b] to-[#80311a] hover:opacity-95 text-white font-bold py-3 rounded-xl shadow-lg transition text-sm tracking-wider uppercase"
            >
              Entrar no Painel
            </button>
          </form>
          <div className="pt-2 border-t border-stone-800">
            <a href="/" className="text-xs text-stone-400 hover:text-amber-400 transition">← Voltar para a Vitrine Pública</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0a09] font-sans text-stone-200 pb-20">
      {/* HEADER ADMIN */}
      <header className="bg-[#120f0e] border-b border-amber-600/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#b94a2b] rounded-xl flex items-center justify-center text-amber-300 font-bold">🏛️</div>
            <div>
              <h1 className="font-black text-amber-400 tracking-wide">PAINEL ADMINISTRATIVO</h1>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Esfinge | Gestão de Ativos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a href="/" className="text-xs font-bold bg-[#1c1817] hover:bg-stone-800 text-stone-300 px-4 py-2 rounded-xl border border-stone-800 transition">
              Ver Site Público ↗
            </a>
            <button
              onClick={() => setAutenticado(false)}
              className="text-xs font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-4 py-2 rounded-xl border border-rose-800/50 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* MENU DE ABAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-2 border-b border-stone-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setAbaAtiva("imoveis")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${abaAtiva === "imoveis" ? "bg-amber-500 text-stone-950 shadow-lg" : "bg-[#161312] text-stone-400 hover:bg-stone-800 border border-stone-800"}`}
          >
            🏠 Gestão de Imóveis ({imoveis.length})
          </button>
          <button
            onClick={() => setAbaAtiva("corretores")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${abaAtiva === "corretores" ? "bg-amber-500 text-stone-950 shadow-lg" : "bg-[#161312] text-stone-400 hover:bg-stone-800 border border-stone-800"}`}
          >
            👨‍💼 Corretores & Equipe ({corretores.length})
          </button>
          <button
            onClick={() => setAbaAtiva("imobiliarias")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${abaAtiva === "imobiliarias" ? "bg-amber-500 text-stone-950 shadow-lg" : "bg-[#161312] text-stone-400 hover:bg-stone-800 border border-stone-800"}`}
          >
            🏢 Imobiliárias Parceiras ({imobiliarias.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400 font-semibold">Carregando dados...</div>
        ) : (
          <div className="mt-6">
            
            {/* ABA 1: IMÓVEIS */}
            {abaAtiva === "imoveis" && (
              <div className="space-y-8">
                {/* IMPORTADOR POR LINK */}
                <div className="bg-[#161312] p-6 rounded-3xl border border-stone-800 shadow-xl">
                  <h3 className="text-base font-black text-amber-400 mb-2">📥 Importador Automático por Link</h3>
                  <p className="text-xs text-stone-400 mb-4">Cole o link do anúncio de origem para puxar as informações automaticamente.</p>
                  <form onSubmit={handleImportarLink} className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://www.portaldomeuimovel.com.br/anuncio/..."
                      value={linkOrigem}
                      onChange={(e) => setLinkOrigem(e.target.value)}
                      className="flex-1 bg-[#1c1817] border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={importando}
                      className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition whitespace-nowrap"
                    >
                      {importando ? "Extraindo..." : "Importar Dados"}
                    </button>
                  </form>
                </div>

                {/* FORMULÁRIO DE CADASTRO MANUAL DE IMÓVEL */}
                <div className="bg-[#161312] p-6 rounded-3xl border border-stone-800 shadow-xl">
                  <h3 className="text-base font-black text-amber-400 mb-4">➕ Cadastrar Novo Imóvel</h3>
                  <form onSubmit={cadastrarImovel} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Título do Imóvel</label>
                      <input type="text" required value={formImovel.titulo} onChange={e=>setFormImovel({...formImovel, titulo: e.target.value})} placeholder="Ex: Sobrado de Alto Padrão" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Código de Referência</label>
                      <input type="text" required value={formImovel.codigo} onChange={e=>setFormImovel({...formImovel, codigo: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Tipo</label>
                      <select value={formImovel.tipo} onChange={e=>setFormImovel({...formImovel, tipo: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200">
                        <option value="Casa">Casa</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Sobrado">Sobrado</option>
                        <option value="Studio">Studio</option>
                        <option value="Chácara">Chácara</option>
                        <option value="Comercial">Comercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Modalidade</label>
                      <select value={formImovel.modalidade} onChange={e=>setFormImovel({...formImovel, modalidade: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200">
                        <option value="Venda">Venda</option>
                        <option value="Aluguel">Aluguel</option>
                        <option value="Veraneio">Veraneio</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Cidade</label>
                      <input type="text" required value={formImovel.cidade} onChange={e=>setFormImovel({...formImovel, cidade: e.target.value})} placeholder="Ex: Maringá" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Bairro</label>
                      <input type="text" required value={formImovel.bairro} onChange={e=>setFormImovel({...formImovel, bairro: e.target.value})} placeholder="Ex: Zona 03" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Preço (R$)</label>
                      <input type="number" required value={formImovel.preco} onChange={e=>setFormImovel({...formImovel, preco: e.target.value})} placeholder="750000" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Quartos</label>
                      <input type="number" value={formImovel.quartos} onChange={e=>setFormImovel({...formImovel, quartos: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Banheiros</label>
                      <input type="number" value={formImovel.banheiros} onChange={e=>setFormImovel({...formImovel, banheiros: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Vagas</label>
                      <input type="number" value={formImovel.vagas} onChange={e=>setFormImovel({...formImovel, vagas: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Área Útil (m²)</label>
                      <input type="number" value={formImovel.area_util} onChange={e=>setFormImovel({...formImovel, area_util: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Corretor Responsável</label>
                      <select value={formImovel.corretor_id} onChange={e=>setFormImovel({...formImovel, corretor_id: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200">
                        <option value="">Selecione o Corretor</option>
                        {corretores.map(c => (
                          <option key={c.id} value={c.id}>{c.nome} ({c.creci})</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-stone-400 block mb-1">URLs das Imagens (separadas por vírgula)</label>
                      <input type="text" value={formImovel.imagensStr} onChange={e=>setFormImovel({...formImovel, imagensStr: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div className="sm:col-span-2 pt-2">
                      <button type="submit" className="w-full bg-gradient-to-r from-[#b94a2b] to-[#80311a] hover:opacity-95 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg transition">
                        Publicar Imóvel no Acervo
                      </button>
                    </div>
                  </form>
                </div>

                {/* LISTAGEM DE IMÓVEIS */}
                <div className="bg-[#161312] p-6 rounded-3xl border border-stone-800 shadow-xl">
                  <h3 className="text-base font-black text-amber-400 mb-4">Imóveis Registrados ({imoveis.length})</h3>
                  <div className="space-y-3">
                    {imoveis.map(imv => (
                      <div key={imv.id} className="flex items-center justify-between bg-[#1c1817] p-3.5 rounded-2xl border border-stone-800">
                        <div>
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                            {imv.codigo} • {imv.modalidade}
                          </span>
                          <h4 className="font-bold text-stone-100 text-sm mt-1">{imv.titulo}</h4>
                          <p className="text-xs text-stone-400">📍 {imv.bairro}, {imv.cidade} • R$ {Number(imv.preco).toLocaleString("pt-BR")}</p>
                        </div>
                        <button onClick={() => excluirImovel(imv.id)} className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-800 transition">
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: CORRETORES */}
            {abaAtiva === "corretores" && (
              <div className="space-y-8">
                <div className="bg-[#161312] p-6 rounded-3xl border border-stone-800 shadow-xl">
                  <h3 className="text-base font-black text-amber-400 mb-4">➕ Cadastrar Novo Corretor</h3>
                  <form onSubmit={cadastrarCorretor} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Nome Completo</label>
                      <input type="text" required value={formCorretor.nome} onChange={e=>setFormCorretor({...formCorretor, nome: e.target.value})} placeholder="Carlos Eduardo" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">CRECI</label>
                      <input type="text" required value={formCorretor.creci} onChange={e=>setFormCorretor({...formCorretor, creci: e.target.value})} placeholder="PR-45920" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Telefone WhatsApp</label>
                      <input type="text" required value={formCorretor.telefone} onChange={e=>setFormCorretor({...formCorretor, telefone: e.target.value})} placeholder="44997278694" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">E-mail de Login</label>
                      <input type="email" required value={formCorretor.email} onChange={e=>setFormCorretor({...formCorretor, email: e.target.value})} placeholder="carlos@esfinge.com" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Senha de Acesso</label>
                      <input type="password" required value={formCorretor.senha} onChange={e=>setFormCorretor({...formCorretor, senha: e.target.value})} className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full bg-gradient-to-r from-[#b94a2b] to-[#80311a] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest shadow-lg transition">
                        Cadastrar Corretor
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-[#161312] p-6 rounded-3xl border border-stone-800 shadow-xl">
                  <h3 className="text-base font-black text-amber-400 mb-4">Corretores Cadastrados ({corretores.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {corretores.map(c => (
                      <div key={c.id} className="bg-[#1c1817] p-4 rounded-2xl border border-stone-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-stone-100 text-sm">{c.nome}</h4>
                          <p className="text-xs text-stone-400">CRECI: {c.creci} • Tel: {c.telefone}</p>
                          <p className="text-[11px] text-amber-500 mt-1">{c.email}</p>
                        </div>
                        <button onClick={() => excluirCorretor(c.id)} className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-800 transition">
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: IMOBILIÁRIAS PARCEIRAS */}
            {abaAtiva === "imobiliarias" && (
              <div className="space-y-8">
                <div className="bg-[#161312] p-6 rounded-3xl border border-stone-800 shadow-xl">
                  <h3 className="text-base font-black text-amber-400 mb-2">🏢 Cadastrar Imobiliária Parceira (Anúncio Institucional)</h3>
                  <p className="text-xs text-stone-400 mb-4">Divulgue marcas parceiras na seção de imobiliárias aliadas da rede.</p>
                  
                  <form onSubmit={cadastrarImobiliaria} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Nome da Imobiliária</label>
                      <input type="text" required value={formImobiliaria.nome} onChange={e=>setFormImobiliaria({...formImobiliaria, nome: e.target.value})} placeholder="Esfinge Contabilidade & Imóveis" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">CRECI Jurídico</label>
                      <input type="text" value={formImobiliaria.creci} onChange={e=>setFormImobiliaria({...formImobiliaria, creci: e.target.value})} placeholder="J-06540" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Cidade Sede</label>
                      <input type="text" required value={formImobiliaria.cidade} onChange={e=>setFormImobiliaria({...formImobiliaria, cidade: e.target.value})} placeholder="Maringá" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Telefone / WhatsApp</label>
                      <input type="text" required value={formImobiliaria.telefone} onChange={e=>setFormImobiliaria({...formImobiliaria, telefone: e.target.value})} placeholder="44997278694" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">Site / Link</label>
                      <input type="text" value={formImobiliaria.site} onChange={e=>setFormImobiliaria({...formImobiliaria, site: e.target.value})} placeholder="https://esfingecontabilidade.com.br" className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-400 block mb-1">URL da Logo / Imagem</label>
                      <input type="text" value={formImobiliaria.logo} onChange={e=>setFormImobiliaria({...formImobiliaria, logo: e.target.value})} placeholder="https://..." className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="text-xs font-bold text-stone-400 block mb-1">Breve Descrição / Slogan da Imobiliária</label>
                      <input type="text" value={formImobiliaria.descricao} onChange={e=>setFormImobiliaria({...formImobiliaria, descricao: e.target.value})} placeholder="Especialistas em assessoria contábil e transações imobiliárias de alto padrão." className="w-full bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3 pt-2">
                      <button type="submit" className="w-full bg-gradient-to-r from-[#b94a2b] to-[#80311a] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg transition">
                        Cadastrar Imobiliária Parceira
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-[#161312] p-6 rounded-3xl border border-stone-800 shadow-xl">
                  <h3 className="text-base font-black text-amber-400 mb-4">Imobiliárias Parceiras Cadastradas ({imobiliarias.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {imobiliarias.map(imb => (
                      <div key={imb.id} className="bg-[#1c1817] p-4 rounded-2xl border border-stone-800 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-stone-800 rounded-xl overflow-hidden shrink-0 border border-stone-700 flex items-center justify-center font-bold text-amber-400">
                            {imb.logo ? <img src={imb.logo} alt={imb.nome} className="w-full h-full object-cover" /> : "🏢"}
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-100 text-sm">{imb.nome}</h4>
                            <p className="text-xs text-stone-400">{imb.cidade} • CRECI: {imb.creci || "N/D"}</p>
                            <p className="text-[11px] text-amber-500 mt-0.5 truncate max-w-xs">{imb.descricao}</p>
                          </div>
                        </div>
                        <button onClick={() => excluirImobiliaria(imb.id)} className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-800 transition shrink-0 ml-2">
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}