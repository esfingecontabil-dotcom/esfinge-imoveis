"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [senhaInput, setSenhaInput] = useState("");
  const [erroLogin, setErroLogin] = useState("");

  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Formulário de novo imóvel
  const [novoImovel, setNovoImovel] = useState({
    titulo: "",
    tipo: "Casa",
    modalidade: "Venda",
    cidade: "Matinhos",
    bairro: "",
    preco: "",
    preco_alta_temporada: "",
    taxa_limpeza: "",
    capacidade_pessoas: "",
    quartos: "2",
    banheiros: "1",
    vagas: "1",
    area_m2: "",
    imagem_url: "",
    descricao: "",
    com_ar_condicionado: true,
    com_piscina: false,
    com_churrasqueira: true,
    vista_mar: false,
    aceita_pet: true,
  });

  // Autenticação simples
  const handleLogin = (e) => {
    e.preventDefault();
    if (senhaInput === "admin" || senhaInput === "esfinge" || senhaInput === "123456") {
      setIsAuthenticated(true);
      setErroLogin("");
    } else {
      setErroLogin("Senha incorreta. Tente novamente.");
    }
  };

  // Carregar imóveis
  const carregarImoveis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .order("id", { ascending: false });

      if (!error && data) {
        setImoveis(data);
      }
    } catch (err) {
      console.error("Erro ao carregar imóveis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      carregarImoveis();
    }
  }, [isAuthenticated]);

  // Cadastrar Imóvel
  const handleCadastrar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso("");

    try {
      const payload = {
        titulo: novoImovel.titulo,
        tipo: novoImovel.tipo,
        modalidade: novoImovel.modalidade,
        uf: "PR",
        cidade: novoImovel.cidade,
        bairro: novoImovel.bairro || "Centro",
        bairro_balneario: novoImovel.bairro || "Centro",
        preco: Number(novoImovel.preco) || 0,
        preco_alta_temporada: Number(novoImovel.preco_alta_temporada) || null,
        taxa_limpeza: Number(novoImovel.taxa_limpeza) || null,
        capacidade_pessoas: Number(novoImovel.capacidade_pessoas) || null,
        quartos: Number(novoImovel.quartos) || 0,
        banheiros: Number(novoImovel.banheiros) || 0,
        vagas: Number(novoImovel.vagas) || 0,
        area_m2: Number(novoImovel.area_m2) || null,
        imagem_url: novoImovel.imagem_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        imagens: [
          novoImovel.imagem_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        ],
        descricao: novoImovel.descricao,
        com_ar_condicionado: Boolean(novoImovel.com_ar_condicionado),
        com_piscina: Boolean(novoImovel.com_piscina),
        com_churrasqueira: Boolean(novoImovel.com_churrasqueira),
        vista_mar: Boolean(novoImovel.vista_mar),
        aceita_pet: Boolean(novoImovel.aceita_pet),
        ativo: true,
        status: "disponivel",
      };

      const { error } = await supabase.from("imoveis").insert([payload]);

      if (error) {
        alert(`Erro ao cadastrar: ${error.message}`);
      } else {
        setMensagemSucesso("✅ Imóvel cadastrado com sucesso!");
        setNovoImovel({
          titulo: "",
          tipo: "Casa",
          modalidade: "Venda",
          cidade: "Matinhos",
          bairro: "",
          preco: "",
          preco_alta_temporada: "",
          taxa_limpeza: "",
          capacidade_pessoas: "",
          quartos: "2",
          banheiros: "1",
          vagas: "1",
          area_m2: "",
          imagem_url: "",
          descricao: "",
          com_ar_condicionado: true,
          com_piscina: false,
          com_churrasqueira: true,
          vista_mar: false,
          aceita_pet: true,
        });
        carregarImoveis();
      }
    } catch (err) {
      alert("Erro ao processar cadastro.");
    } finally {
      setSalvando(false);
    }
  };

  // Alternar Ativo/Inativo
  const alternarAtivo = async (id, statusAtual) => {
    try {
      const { error } = await supabase
        .from("imoveis")
        .update({ ativo: !statusAtual })
        .eq("id", id);

      if (!error) {
        setImoveis((prev) =>
          prev.map((imv) => (imv.id === id ? { ...imv, ativo: !statusAtual } : imv))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Excluir Imóvel
  const excluirImovel = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este imóvel?")) return;

    try {
      const { error } = await supabase.from("imoveis").delete().eq("id", id);
      if (!error) {
        setImoveis((prev) => prev.filter((imv) => imv.id !== id));
      } else {
        alert(`Erro ao excluir: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-amber-600/30 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-3xl mx-auto shadow-lg shadow-amber-600/20">
              🏰
            </div>
            <h1 className="text-2xl font-black text-amber-500 font-serif">Painel Esfinge</h1>
            <p className="text-xs text-neutral-400">Área restrita de gestão de imóveis</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-amber-200 block mb-1.5">Senha de Acesso</label>
              <input
                type="password"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full px-4 py-3 bg-black border border-amber-600/30 rounded-xl text-sm outline-none focus:border-amber-500 text-amber-100"
                required
              />
            </div>

            {erroLogin && <p className="text-xs text-red-400 font-bold">{erroLogin}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
            >
              Entrar no Painel
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="/" className="text-xs text-amber-400 hover:underline">
              ← Voltar para a Vitrine
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Painel Administrativo Principal
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER ADMIN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-amber-600/30 p-6 rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl">
              🏰
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-500 font-serif">
                Painel do Corretor & Gestão
              </h1>
              <p className="text-xs text-neutral-400">
                {imoveis.length} imóveis cadastrados no banco de dados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="px-4 py-2 bg-black border border-amber-600/30 rounded-xl text-xs font-bold text-amber-400 hover:bg-neutral-800 transition"
            >
              🌐 Ver Site
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-950 border border-red-800 text-red-300 rounded-xl text-xs font-bold hover:bg-red-900 transition"
            >
              Sair
            </button>
          </div>
        </div>

        {/* FORMULÁRIO DE CADASTRO */}
        <div className="bg-neutral-900 border border-amber-600/30 p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
            <span>➕</span>
            <span>Cadastrar Novo Imóvel</span>
          </h2>

          {mensagemSucesso && (
            <div className="p-4 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-bold">
              {mensagemSucesso}
            </div>
          )}

          <form onSubmit={handleCadastrar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-amber-200 block mb-1">Título do Anúncio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sobrado Triplex com Piscina a 100m do Mar"
                  value={novoImovel.titulo}
                  onChange={(e) => setNovoImovel({ ...novoImovel, titulo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">Modalidade</label>
                <select
                  value={novoImovel.modalidade}
                  onChange={(e) => setNovoImovel({ ...novoImovel, modalidade: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-amber-400 font-bold"
                >
                  <option value="Venda">Venda</option>
                  <option value="Temporada">Temporada (Veraneio)</option>
                  <option value="Locação Anual">Locação Anual</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">Tipo de Imóvel</label>
                <select
                  value={novoImovel.tipo}
                  onChange={(e) => setNovoImovel({ ...novoImovel, tipo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                >
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Sobrado">Sobrado</option>
                  <option value="Studio">Studio</option>
                  <option value="Terreno">Terreno</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">Cidade</label>
                <select
                  value={novoImovel.cidade}
                  onChange={(e) => setNovoImovel({ ...novoImovel, cidade: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                >
                  <option value="Matinhos">Matinhos</option>
                  <option value="Pontal do Paraná">Pontal do Paraná</option>
                  <option value="Guaratuba">Guaratuba</option>
                  <option value="Maringá">Maringá</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">Bairro / Balneário</label>
                <input
                  type="text"
                  placeholder="Ex: Caiobá, Ipanema, Brejatuba"
                  value={novoImovel.bairro}
                  onChange={(e) => setNovoImovel({ ...novoImovel, bairro: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">
                  {novoImovel.modalidade === "Temporada" ? "Valor da Diária (R$)" : novoImovel.modalidade.includes("Locação") ? "Aluguel Mensal (R$)" : "Preço de Venda (R$)"}
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 650000 ou 650"
                  value={novoImovel.preco}
                  onChange={(e) => setNovoImovel({ ...novoImovel, preco: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">Quartos</label>
                <input
                  type="number"
                  value={novoImovel.quartos}
                  onChange={(e) => setNovoImovel({ ...novoImovel, quartos: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">Banheiros</label>
                <input
                  type="number"
                  value={novoImovel.banheiros}
                  onChange={(e) => setNovoImovel({ ...novoImovel, banheiros: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">Vagas de Garagem</label>
                <input
                  type="number"
                  value={novoImovel.vagas}
                  onChange={(e) => setNovoImovel({ ...novoImovel, vagas: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1">Área Útil (m²)</label>
                <input
                  type="number"
                  placeholder="Ex: 120"
                  value={novoImovel.area_m2}
                  onChange={(e) => setNovoImovel({ ...novoImovel, area_m2: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-amber-200 block mb-1">URL da Foto de Capa</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={novoImovel.imagem_url}
                  onChange={(e) => setNovoImovel({ ...novoImovel, imagem_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-amber-200 block mb-1">Descrição Detalhada</label>
              <textarea
                rows={3}
                placeholder="Descreva os diferenciais do imóvel, acabamentos, localização..."
                value={novoImovel.descricao}
                onChange={(e) => setNovoImovel({ ...novoImovel, descricao: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-black border border-amber-600/30 rounded-xl text-xs outline-none focus:border-amber-500 text-neutral-100"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-amber-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={novoImovel.com_ar_condicionado}
                  onChange={(e) => setNovoImovel({ ...novoImovel, com_ar_condicionado: e.target.checked })}
                  className="accent-amber-500"
                />
                <span>Ar-Condicionado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={novoImovel.com_piscina}
                  onChange={(e) => setNovoImovel({ ...novoImovel, com_piscina: e.target.checked })}
                  className="accent-amber-500"
                />
                <span>Piscina</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={novoImovel.aceita_pet}
                  onChange={(e) => setNovoImovel({ ...novoImovel, aceita_pet: e.target.checked })}
                  className="accent-amber-500"
                />
                <span>Pet Friendly</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-50"
            >
              {salvando ? "Cadastrando no Banco..." : "Salvar e Publicar Imóvel"}
            </button>
          </form>
        </div>

        {/* LISTAGEM DE IMÓVEIS EXISTENTES */}
        <div className="bg-neutral-900 border border-amber-600/30 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
              <span>📋</span>
              <span>Imóveis na Base de Dados</span>
            </h2>
            <button
              onClick={carregarImoveis}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              🔄 Recarregar Lista
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-neutral-400">Carregando imóveis...</p>
          ) : imoveis.length === 0 ? (
            <p className="text-xs text-neutral-400">Nenhum imóvel cadastrado no banco.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-black/60 text-amber-400 uppercase font-black border-b border-amber-900/40">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Título</th>
                    <th className="p-3">Local</th>
                    <th className="p-3">Modalidade</th>
                    <th className="p-3">Preço</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {imoveis.map((imv) => (
                    <tr key={imv.id} className="hover:bg-black/30 transition">
                      <td className="p-3 font-mono text-neutral-500">#{imv.id}</td>
                      <td className="p-3 font-bold text-white max-w-xs truncate">{imv.titulo}</td>
                      <td className="p-3">
                        {imv.cidade} ({imv.bairro || imv.bairro_balneario || "Centro"})
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                          {imv.modalidade || "Venda"}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-amber-300">
                        {Number(imv.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => alternarAtivo(imv.id, imv.ativo)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black transition ${
                            imv.ativo
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-red-950 text-red-400 border border-red-800"
                          }`}
                        >
                          {imv.ativo ? "● Ativo" : "○ Inativo"}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => excluirImovel(imv.id)}
                          className="text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-red-950/40 rounded border border-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}