"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import BannerPosicionamento from "@/components/BannerPosicionamento";

export const dynamic = "force-dynamic";

export interface Imovel {
  id: number | string;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  cidade: string;
  bairro: string;
  modalidade: string;
  preco: number;
  precoAltaTemporada?: number;
  taxaLimpeza?: number;
  capacidadePessoas?: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  areaUtil: number;
  aceitaPet: boolean;
  arCondicionado: boolean;
  comPiscina: boolean;
  imagens: string[];
  corretor: {
    nome: string;
    creci: string;
    telefone: string;
  };
  destaque?: boolean;
}

const CATEGORIAS = [
  { id: "Todos", label: "Todos", icon: "✨" },
  { id: "Casa", label: "Casas", icon: "🏠" },
  { id: "Apartamento", label: "Apartamentos", icon: "🏢" },
  { id: "Sobrado", label: "Sobrados", icon: "🏡" },
  { id: "Studio", label: "Studios", icon: "🛋️" },
  { id: "Chácara", label: "Chácaras", icon: "🌾" },
];

export default function Home() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  const [buscaTexto, setBuscaTexto] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [modalidade, setModalidade] = useState<string>("Todos");
  const [cidade, setCidade] = useState("Todas");
  const [apenasPet, setApenasPet] = useState(false);
  const [apenasAr, setApenasAr] = useState(false);
  const [favoritos, setFavoritos] = useState<(number | string)[]>([]);

  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);

  useEffect(() => {
    async function carregarImoveisPublicos() {
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .select("*")
          .order("id", { ascending: false });

        if (error) {
          console.error("Erro ao carregar do Supabase:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const formatados: Imovel[] = data.map((item: any) => {
            const fotos = Array.isArray(item.imagens) && item.imagens.length > 0
              ? item.imagens
              : item.imagem_url
              ? [item.imagem_url]
              : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"];

            return {
              id: item.id,
              codigo: item.codigo || `ESF-${item.id}`,
              titulo: item.titulo || "Imóvel Esfinge",
              descricao: item.descricao || "",
              tipo: item.tipo || "Casa",
              cidade: item.cidade || "Matinhos",
              bairro: item.bairro || item.bairro_balneario || "Centro",
              modalidade: item.modalidade || "Venda",
              preco: Number(item.preco) || 0,
              precoAltaTemporada: Number(item.preco_alta_temporada) || 0,
              taxaLimpeza: Number(item.taxa_limpeza) || 0,
              capacidadePessoas: Number(item.capacidade_pessoas) || 0,
              quartos: Number(item.quartos) || 0,
              banheiros: Number(item.banheiros) || 0,
              vagas: Number(item.vagas) || 0,
              areaUtil: Number(item.area_m2) || Number(item.area_util) || Number(item.area) || 0,
              aceitaPet: item.aceita_pet ?? true,
              arCondicionado: item.com_ar_condicionado ?? item.ar_condicionado ?? true,
              comPiscina: item.com_piscina ?? false,
              imagens: fotos,
              corretor: {
                nome: "Atendimento Esfinge",
                creci: "PR-45920",
                telefone: "44997278694",
              },
              destaque: item.destaque || false,
            };
          });

          setImoveis(formatados);
        }
      } catch (err) {
        console.error("Erro ao buscar imóveis:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarImoveisPublicos();
  }, []);

  const cidadesDisponiveis = useMemo(() => {
    const lista = Array.from(new Set(imoveis.map((imv) => imv.cidade))).filter(Boolean);
    return ["Todas", ...lista];
  }, [imoveis]);

  const formatarPreco = (imovel: Imovel) => {
    const val = Number(imovel.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const mod = imovel.modalidade.toLowerCase();
    if (mod.includes("temporada") || mod.includes("veraneio")) {
      return `${val} / diária`;
    }
    if (mod.includes("aluguel") || mod.includes("locação") || mod.includes("locacao")) {
      return `${val} / mês`;
    }
    return val;
  };

  const imoveisFiltrados = useMemo(() => {
    return imoveis.filter((imovel) => {
      if (buscaTexto.trim() !== "") {
        const termo = buscaTexto.toLowerCase();
        const matchTitulo = imovel.titulo.toLowerCase().includes(termo);
        const matchBairro = imovel.bairro.toLowerCase().includes(termo);
        const matchCidade = imovel.cidade.toLowerCase().includes(termo);
        const matchCodigo = imovel.codigo.toLowerCase().includes(termo);
        if (!matchTitulo && !matchBairro && !matchCidade && !matchCodigo) return false;
      }

      if (categoriaSelecionada !== "Todos" && imovel.tipo.toLowerCase() !== categoriaSelecionada.toLowerCase()) {
        return false;
      }

      if (modalidade !== "Todos") {
        const modImovel = imovel.modalidade.toLowerCase();
        const modFiltro = modalidade.toLowerCase();
        if (modFiltro === "temporada" && !modImovel.includes("temporada") && !modImovel.includes("veraneio")) return false;
        if (modFiltro === "locacao" && !modImovel.includes("anual") && !modImovel.includes("aluguel") && !modImovel.includes("locação")) return false;
        if (modFiltro === "venda" && !modImovel.includes("venda")) return false;
      }

      if (cidade !== "Todas" && imovel.cidade.toLowerCase() !== cidade.toLowerCase()) {
        return false;
      }

      if (apenasPet && !imovel.aceitaPet) return false;
      if (apenasAr && !imovel.arCondicionado) return false;

      return true;
    });
  }, [imoveis, buscaTexto, categoriaSelecionada, modalidade, cidade, apenasPet, apenasAr]);

  const toggleFavorito = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 flex flex-col justify-between selection:bg-amber-600 selection:text-black">
      <div>
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-amber-600/30 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between gap-4 py-3">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-amber-600/20 shrink-0 border border-amber-400/30">
                🏰
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl text-amber-500 tracking-wider font-serif">
                  ESFINGE
                </span>
                <span className="text-amber-200/80 text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase">
                  GUARDIÃO DE IMÓVEIS
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <a
                href="/admin"
                className="text-xs sm:text-sm font-semibold text-amber-200/90 hover:text-amber-400 px-4 py-2 rounded-full hover:bg-neutral-900 transition border border-amber-600/30"
              >
                <span>👨‍💼 Área do Corretor</span>
              </a>
              <a
                href="https://wa.me/5544997278694"
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-emerald-900/40 transition inline-flex items-center justify-center space-x-1.5"
              >
                <span>💬</span>
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="border-t border-amber-900/30 bg-black/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSelecionada(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    categoriaSelecionada === cat.id
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black font-black shadow-amber-600/30 scale-105"
                      : "bg-neutral-900 text-amber-100/70 hover:bg-neutral-800 hover:text-white border border-amber-900/40"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* PAINEL PRINCIPAL COM FILTROS */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12 pb-16">
          <div className="bg-neutral-900/90 p-6 sm:p-8 rounded-3xl border border-amber-600/30 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-1/2 relative">
                <span className="absolute left-4 top-3.5 text-amber-500 font-bold">🔍</span>
                <input
                  type="text"
                  placeholder="Busque por código, bairro, cidade ou título..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black border border-amber-600/30 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 text-amber-100 placeholder-neutral-500 font-semibold transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                  className="p-3.5 bg-black border border-amber-600/30 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 font-extrabold text-amber-400 cursor-pointer shadow-sm"
                >
                  <option value="Todos">Todas as Modalidades</option>
                  <option value="Temporada">🏖️ Temporada (Veraneio)</option>
                  <option value="Locacao">🔑 Locação Anual (Integral)</option>
                  <option value="Venda">🏷️ Venda</option>
                </select>

                <select
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="p-3.5 bg-black border border-amber-600/30 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 font-extrabold text-amber-400 cursor-pointer shadow-sm"
                >
                  {cidadesDisponiveis.map((c) => (
                    <option key={c} value={c}>
                      {c === "Todas" ? "Todas as Cidades" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-neutral-800 text-xs font-bold text-amber-200/80">
              <label className="flex items-center space-x-2.5 cursor-pointer bg-black/60 hover:bg-black px-3 py-2 rounded-xl border border-amber-600/20 transition">
                <input
                  type="checkbox"
                  checked={apenasPet}
                  onChange={(e) => setApenasPet(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>🐾 Pet Friendly</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-black/60 hover:bg-black px-3 py-2 rounded-xl border border-amber-600/20 transition">
                <input
                  type="checkbox"
                  checked={apenasAr}
                  onChange={(e) => setApenasAr(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>❄️ Ar-Condicionado</span>
              </label>
            </div>
          </div>

          <BannerPosicionamento />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight flex items-center gap-2 font-serif">
                <span>Imóveis sob a Guarda da Esfinge</span>
                <span className="text-xs bg-amber-950/80 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-700/50 font-sans">
                  {imoveisFiltrados.length} disponíveis
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Vendas, Locação Anual e Casas de Temporada no Litoral e Região
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-24 text-amber-500/60 font-bold text-base">
              Carregando vitrine de imóveis...
            </div>
          ) : imoveisFiltrados.length === 0 ? (
            <div className="text-center py-28 bg-neutral-900 rounded-3xl border border-amber-600/30 space-y-4">
              <div className="text-4xl">🏰</div>
              <p className="text-base font-bold text-amber-200/80">
                Nenhum imóvel encontrado com esses filtros.
              </p>
              <button
                onClick={() => {
                  setBuscaTexto("");
                  setCategoriaSelecionada("Todos");
                  setModalidade("Todos");
                  setCidade("Todas");
                  setApenasPet(false);
                  setApenasAr(false);
                }}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black px-6 py-3 rounded-xl text-xs transition shadow-md"
              >
                Limpar Filtros e Ver Todos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {imoveisFiltrados.map((imovel) => {
                const isFav = favoritos.includes(imovel.id);
                const isTemporada = imovel.modalidade.toLowerCase().includes("temporada") || imovel.modalidade.toLowerCase().includes("veraneio");

                return (
                  <div
                    key={imovel.id}
                    onClick={() => setImovelSelecionado(imovel)}
                    className="group bg-neutral-900 rounded-3xl overflow-hidden border border-amber-600/30 shadow-xl hover:shadow-amber-600/10 hover:border-amber-500/60 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] w-full bg-black overflow-hidden">
                      <img
                        src={imovel.imagens[0]}
                        alt={imovel.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80 group-hover:opacity-50 transition"></div>

                      <button
                        onClick={(e) => toggleFavorito(imovel.id, e)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/80 border border-amber-600/30 backdrop-blur-md flex items-center justify-center text-lg hover:scale-110 transition shadow-lg z-10"
                      >
                        {isFav ? "❤️" : "🤍"}
                      </button>

                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-10">
                        <span className="bg-black/90 backdrop-blur-md text-amber-400 border border-amber-600/40 text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow">
                          REF: {imovel.codigo}
                        </span>
                        <span
                          className={`text-[11px] font-black px-3 py-1 rounded-lg text-black uppercase tracking-wider shadow ${
                            isTemporada
                              ? "bg-gradient-to-r from-teal-400 to-emerald-400"
                              : imovel.modalidade === "Venda"
                              ? "bg-gradient-to-r from-amber-500 to-amber-400"
                              : "bg-gradient-to-r from-amber-200 to-yellow-300"
                          }`}
                        >
                          {imovel.modalidade}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-amber-500 font-extrabold">
                            📍 {imovel.bairro}, {imovel.cidade}
                          </span>
                          <span className="bg-black border border-amber-600/20 px-2.5 py-1 rounded-md text-amber-200/80">
                            {imovel.tipo}
                          </span>
                        </div>
                        <h3 className="font-black text-amber-100 text-lg line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {imovel.titulo}
                        </h3>
                        <div className="grid grid-cols-4 gap-1 text-[11px] text-amber-200/70 mt-3 font-bold bg-black/50 p-2.5 rounded-2xl border border-amber-600/20 text-center">
                          <div>🛏️ {imovel.quartos} qts</div>
                          <div>🚿 {imovel.banheiros} ban</div>
                          <div>🚗 {imovel.vagas} vag</div>
                          {isTemporada && imovel.capacidadePessoas && imovel.capacidadePessoas > 0 ? (
                            <div>👥 {imovel.capacidadePessoas} pess</div>
                          ) : (
                            <div>📐 {imovel.areaUtil}m²</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-black uppercase tracking-wider">
                            {isTemporada ? "Valor da Diária" : imovel.modalidade.includes("Locação") ? "Aluguel Mensal" : "Valor de Venda"}
                          </span>
                          <span className="text-xl font-black text-amber-400">
                            {formatarPreco(imovel)}
                          </span>
                        </div>
                        <a
                          href={`https://wa.me/55${imovel.corretor.telefone}?text=${encodeURIComponent(
                            `Olá! Gostaria de informações sobre o imóvel (${imovel.modalidade}) ${imovel.titulo} (Ref: ${imovel.codigo})`
                          )}`}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-2xl transition shadow-lg shadow-emerald-950/50 flex items-center justify-center text-xs font-extrabold space-x-1"
                        >
                          <span>💬 WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PARCEIROS */}
          <section className="bg-gradient-to-r from-neutral-900 via-black to-neutral-900 border border-amber-600/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="inline-flex items-center space-x-2 bg-amber-950/80 border border-amber-600/40 px-3 py-1 rounded-full text-amber-400 text-xs font-black uppercase tracking-wider">
                  <span>🤝 Espaço Parceiros Esfinge</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-serif leading-tight">
                  É Corretor ou Imobiliária? <br className="hidden sm:inline" />
                  <span className="text-amber-500">Divulgue suas locações e vendas sob a nossa guarda.</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                  Plataforma moderna para conectar sua carteira de temporada e anual a turistas e novos moradores de todo o estado.
                </p>
              </div>

              <div className="bg-black border border-amber-600/40 p-6 rounded-2xl text-center space-y-4 shadow-xl">
                <h3 className="font-extrabold text-amber-400 text-lg">Quero Anunciar Meu Portfólio</h3>
                <a
                  href="https://wa.me/5544997278694?text=Olá!%20Sou%20corretor/imobiliária%20e%20gostaria%20de%20anunciar%20meus%20imóveis%20na%20Esfinge."
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black py-3 rounded-xl text-xs transition shadow-lg uppercase tracking-wider"
                >
                  💬 Falar no WhatsApp
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* MODAL DE DETALHES */}
      {imovelSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-600/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-neutral-100">
            <button
              onClick={() => setImovelSelecionado(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black border border-amber-600/30 font-bold text-amber-400 hover:bg-neutral-800 transition flex items-center justify-center"
            >
              ✕
            </button>
            <div className="relative aspect-[16/9] bg-black rounded-2xl overflow-hidden shadow-inner border border-amber-600/20">
              <img
                src={imovelSelecionado.imagens[0]}
                alt={imovelSelecionado.titulo}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-black border border-amber-600/40 text-amber-400 text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                  REF: {imovelSelecionado.codigo}
                </span>
                <span className="text-[11px] font-black px-3 py-1 rounded-lg bg-amber-400 text-black uppercase tracking-wider">
                  {imovelSelecionado.modalidade}
                </span>
              </div>
              <h2 className="text-2xl font-black text-amber-400 mt-3">{imovelSelecionado.titulo}</h2>
              <p className="text-xs text-amber-200/80 font-extrabold mt-1">
                📍 {imovelSelecionado.bairro}, {imovelSelecionado.cidade} • {imovelSelecionado.tipo}
              </p>
              <p className="text-3xl font-black text-amber-500 mt-3">
                {formatarPreco(imovelSelecionado)}
              </p>
              {imovelSelecionado.descricao && (
                <p className="text-xs text-neutral-300 mt-3 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-amber-600/20">
                  {imovelSelecionado.descricao}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-neutral-800 text-center text-xs font-black text-amber-200">
              <div className="bg-black/60 p-3 rounded-2xl border border-amber-600/20">🛏️ {imovelSelecionado.quartos} Quartos</div>
              <div className="bg-black/60 p-3 rounded-2xl border border-amber-600/20">🚿 {imovelSelecionado.banheiros} Banheiros</div>
              <div className="bg-black/60 p-3 rounded-2xl border border-amber-600/20">🚗 {imovelSelecionado.vagas} Vagas</div>
              <div className="bg-black/60 p-3 rounded-2xl border border-amber-600/20">
                {imovelSelecionado.capacidadePessoas && imovelSelecionado.capacidadePessoas > 0
                  ? `👥 ${imovelSelecionado.capacidadePessoas} Pessoas`
                  : `📐 ${imovelSelecionado.areaUtil} m²`}
              </div>
            </div>

            <div className="bg-black border border-amber-600/30 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[10px] text-amber-500 font-black tracking-widest block uppercase">Atendimento</span>
                <span className="font-extrabold text-white text-base">{imovelSelecionado.corretor.nome}</span>
                <span className="text-xs text-neutral-400 block">CRECI: {imovelSelecionado.corretor.creci}</span>
              </div>
              <a
                href={`https://wa.me/55${imovelSelecionado.corretor.telefone}?text=${encodeURIComponent(
                  `Olá! Gostaria de saber mais sobre a locação/venda do imóvel ${imovelSelecionado.titulo} (Ref: ${imovelSelecionado.codigo})`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl text-xs font-extrabold transition shadow-lg shadow-emerald-950/50 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>💬 Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}