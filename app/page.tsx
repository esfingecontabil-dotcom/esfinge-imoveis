"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import BannerPosicionamento from "../components/BannerPosicionamento";

export interface Imovel {
  id: number | string;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  estado: string;
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
  linkOrigem?: string;
  corretor: {
    nome: string;
    creci: string;
    telefone: string;
    imobiliaria: string;
  };
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

  // Filtros
  const [buscaTexto, setBuscaTexto] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [modalidade, setModalidade] = useState<string>("Todos");
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("Todos");
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("Todas");
  const [apenasPet, setApenasPet] = useState(false);
  const [apenasAr, setApenasAr] = useState(false);
  const [favoritos, setFavoritos] = useState<(number | string)[]>([]);

  // Localização & Modal
  const [localizacaoDetectada, setLocalizacaoDetectada] = useState<{ cidade: string; estado: string } | null>(null);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [fotoAtivaIndex, setFotoAtivaIndex] = useState<number>(0);

  // Carregar Imóveis
  useEffect(() => {
    async function carregarImoveis() {
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
            const fotos =
              Array.isArray(item.imagens) && item.imagens.length > 0
                ? item.imagens
                : item.imagem_url
                ? [item.imagem_url]
                : [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                  ];

            const telBruto = (item.corretor_telefone || item.telefone || "44997278694").replace(/\D/g, "");
            const telefoneFormatado = telBruto.startsWith("55") ? telBruto : `55${telBruto}`;

            return {
              id: item.id,
              codigo: item.codigo || `ESF-${item.id}`,
              titulo: item.titulo || "Imóvel em Destaque",
              descricao: item.descricao || "",
              tipo: item.tipo || "Casa",
              estado: item.estado || "PR",
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
              linkOrigem: item.link_origem || "",
              corretor: {
                nome: item.corretor_nome || item.imobiliaria_origem || "Corretor Credenciado",
                creci: item.corretor_creci || "Credenciado",
                telefone: telefoneFormatado,
                imobiliaria: item.imobiliaria_origem || "Imobiliária Parceira",
              },
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

    carregarImoveis();
  }, []);

  // Geolocalização
  useEffect(() => {
    async function detectarGeo() {
      try {
        const res = await fetch("/api/geo");
        const geo = await res.json();

        if (geo.cidade || geo.estado) {
          setLocalizacaoDetectada({ cidade: geo.cidade, estado: geo.estado });

          if (geo.cidade && imoveis.some((imv) => imv.cidade.toLowerCase() === geo.cidade.toLowerCase())) {
            setCidadeSelecionada(geo.cidade);
          } else if (geo.estado && imoveis.some((imv) => imv.estado.toLowerCase() === geo.estado.toLowerCase())) {
            setEstadoSelecionado(geo.estado);
          }
        }
      } catch (e) {
        console.log("Não foi possível detectar localização.");
      }
    }

    if (imoveis.length > 0 && !localizacaoDetectada) {
      detectarGeo();
    }
  }, [imoveis]);

  const estadosDisponiveis = useMemo(() => {
    const lista = Array.from(new Set(imoveis.map((imv) => imv.estado))).filter(Boolean);
    return ["Todos", ...lista];
  }, [imoveis]);

  const cidadesDisponiveis = useMemo(() => {
    const lista = imoveis
      .filter((imv) => (estadoSelecionado === "Todos" ? true : imv.estado === estadoSelecionado))
      .map((imv) => imv.cidade);
    return ["Todas", ...Array.from(new Set(lista)).filter(Boolean)];
  }, [imoveis, estadoSelecionado]);

  const formatarPreco = (imovel: Imovel) => {
    const val = Number(imovel.preco).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const mod = imovel.modalidade.toLowerCase();
    if (mod.includes("temporada") || mod.includes("veraneio")) return `${val} / diária`;
    if (mod.includes("aluguel") || mod.includes("locação") || mod.includes("locacao")) return `${val} / mês`;
    return val;
  };

  const gerarLinkWhatsAppCorretor = (imovel: Imovel) => {
    const texto = `Olá ${imovel.corretor.nome}! Vi o anúncio do imóvel "${imovel.titulo}" (Ref: ${imovel.codigo}) no Portal Esfinge Imóveis (portalesfingeimoveis.com.br) e gostaria de mais informações.`;
    return `https://wa.me/${imovel.corretor.telefone}?text=${encodeURIComponent(texto)}`;
  };

  const imoveisFiltrados = useMemo(() => {
    return imoveis.filter((imovel) => {
      if (buscaTexto.trim() !== "") {
        const termo = buscaTexto.toLowerCase();
        const matchTitulo = imovel.titulo.toLowerCase().includes(termo);
        const matchBairro = imovel.bairro.toLowerCase().includes(termo);
        const matchCidade = imovel.cidade.toLowerCase().includes(termo);
        const matchCodigo = imovel.codigo.toLowerCase().includes(termo);
        const matchCorretor = imovel.corretor.nome.toLowerCase().includes(termo);
        if (!matchTitulo && !matchBairro && !matchCidade && !matchCodigo && !matchCorretor) return false;
      }

      if (estadoSelecionado !== "Todos" && imovel.estado.toLowerCase() !== estadoSelecionado.toLowerCase()) return false;
      if (cidadeSelecionada !== "Todas" && imovel.cidade.toLowerCase() !== cidadeSelecionada.toLowerCase()) return false;
      if (categoriaSelecionada !== "Todos" && imovel.tipo.toLowerCase() !== categoriaSelecionada.toLowerCase()) return false;

      if (modalidade !== "Todos") {
        const modImovel = imovel.modalidade.toLowerCase();
        const modFiltro = modalidade.toLowerCase();
        if (modFiltro === "temporada" && !modImovel.includes("temporada") && !modImovel.includes("veraneio")) return false;
        if (modFiltro === "locacao" && !modImovel.includes("anual") && !modImovel.includes("aluguel") && !modImovel.includes("locação")) return false;
        if (modFiltro === "venda" && !modImovel.includes("venda")) return false;
      }

      if (apenasPet && !imovel.aceitaPet) return false;
      if (apenasAr && !imovel.arCondicionado) return false;

      return true;
    });
  }, [imoveis, buscaTexto, categoriaSelecionada, modalidade, estadoSelecionado, cidadeSelecionada, apenasPet, apenasAr]);

  const abrirDetalhes = (imovel: Imovel) => {
    setImovelSelecionado(imovel);
    setFotoAtivaIndex(0);
  };

  const proximaFoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imovelSelecionado) return;
    setFotoAtivaIndex((prev) => (prev + 1) % imovelSelecionado.imagens.length);
  };

  const fotoAnterior = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imovelSelecionado) return;
    setFotoAtivaIndex((prev) => (prev - 1 + imovelSelecionado.imagens.length) % imovelSelecionado.imagens.length);
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 flex flex-col justify-between selection:bg-amber-600 selection:text-black">
      <div>
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-amber-600/30 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between gap-4 py-3">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="w-12 h-12 bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg border border-amber-400/30">
                🏰
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl text-amber-500 tracking-wider font-serif">
                  ESFINGE
                </span>
                <span className="text-amber-200/80 text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase">
                  PORTAL NACIONAL DE IMÓVEIS
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <a
                href="/admin"
                className="text-xs sm:text-sm font-semibold text-amber-200/90 hover:text-amber-400 px-4 py-2 rounded-full hover:bg-neutral-900 transition border border-amber-600/30"
              >
                👨‍💼 Corretores / Login
              </a>
              <a
                href="https://wa.me/5544997278694?text=Olá!%20Gostaria%20de%20anunciar%20meus%20imóveis%20no%20Portal%20Esfinge."
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-black text-xs sm:text-sm font-black px-5 py-2.5 rounded-full shadow-lg transition"
              >
                🤝 Anunciar Imóveis
              </a>
            </div>
          </div>

          <div className="border-t border-amber-900/30 bg-black/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSelecionada(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    categoriaSelecionada === cat.id
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black font-black scale-105"
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

        {/* FILTROS E CONTEÚDO */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 pb-16">
          {localizacaoDetectada?.cidade && (
            <div className="bg-amber-950/40 border border-amber-600/30 rounded-2xl px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">📍 Sua localização aproximada:</span>
                <span className="font-extrabold text-white bg-black/60 px-3 py-1 rounded-lg border border-amber-600/20">
                  {localizacaoDetectada.cidade} - {localizacaoDetectada.estado || "Brasil"}
                </span>
              </div>
              <button
                onClick={() => {
                  setEstadoSelecionado("Todos");
                  setCidadeSelecionada("Todas");
                }}
                className="text-amber-400 hover:text-amber-300 font-extrabold underline cursor-pointer"
              >
                🌐 Ver imóveis de todo o Brasil
              </button>
            </div>
          )}

          <div className="bg-neutral-900/90 p-6 sm:p-8 rounded-3xl border border-amber-600/30 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-5/12 relative">
                <span className="absolute left-4 top-3.5 text-amber-500 font-bold">🔍</span>
                <input
                  type="text"
                  placeholder="Busque por cidade, bairro, corretor ou código..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black border border-amber-600/30 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 text-amber-100 placeholder-neutral-500 font-semibold"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-7/12 justify-end">
                <select
                  value={estadoSelecionado}
                  onChange={(e) => {
                    setEstadoSelecionado(e.target.value);
                    setCidadeSelecionada("Todas");
                  }}
                  className="p-3.5 bg-black border border-amber-600/30 rounded-2xl text-xs sm:text-sm font-extrabold text-amber-400 cursor-pointer"
                >
                  <option value="Todos">UF: Todos</option>
                  {estadosDisponiveis.filter((uf) => uf !== "Todos").map((uf) => (
                    <option key={uf} value={uf}>UF: {uf}</option>
                  ))}
                </select>

                <select
                  value={cidadeSelecionada}
                  onChange={(e) => setCidadeSelecionada(e.target.value)}
                  className="p-3.5 bg-black border border-amber-600/30 rounded-2xl text-xs sm:text-sm font-extrabold text-amber-400 cursor-pointer"
                >
                  {cidadesDisponiveis.map((c) => (
                    <option key={c} value={c}>{c === "Todas" ? "Todas as Cidades" : c}</option>
                  ))}
                </select>

                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                  className="p-3.5 bg-black border border-amber-600/30 rounded-2xl text-xs sm:text-sm font-extrabold text-amber-400 cursor-pointer"
                >
                  <option value="Todos">Todas as Modalidades</option>
                  <option value="Temporada">🏖️ Temporada</option>
                  <option value="Locacao">🔑 Locação Anual</option>
                  <option value="Venda">🏷️ Venda</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-neutral-800 text-xs font-bold text-amber-200/80">
              <label className="flex items-center space-x-2.5 cursor-pointer bg-black/60 px-3 py-2 rounded-xl border border-amber-600/20">
                <input
                  type="checkbox"
                  checked={apenasPet}
                  onChange={(e) => setApenasPet(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>🐾 Pet Friendly</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-black/60 px-3 py-2 rounded-xl border border-amber-600/20">
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
                <span>Vitrine de Imóveis</span>
                <span className="text-xs bg-amber-950/80 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-700/50 font-sans">
                  {imoveisFiltrados.length} disponíveis
                </span>
              </h1>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-24 text-amber-500/60 font-bold">Carregando vitrine...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {imoveisFiltrados.map((imovel) => {
                const isFav = favoritos.includes(imovel.id);
                const isTemporada =
                  imovel.modalidade.toLowerCase().includes("temporada") ||
                  imovel.modalidade.toLowerCase().includes("veraneio");

                return (
                  <div
                    key={imovel.id}
                    onClick={() => abrirDetalhes(imovel)}
                    className="group bg-neutral-900 rounded-3xl overflow-hidden border border-amber-600/30 shadow-xl hover:border-amber-500/60 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] w-full bg-black overflow-hidden">
                      <img
                        src={imovel.imagens[0]}
                        alt={imovel.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80"></div>

                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-10">
                        <span className="bg-black/90 text-amber-400 border border-amber-600/40 text-[11px] font-black px-3 py-1 rounded-lg">
                          REF: {imovel.codigo}
                        </span>
                        <span className="text-[11px] font-black px-3 py-1 rounded-lg bg-amber-500 text-black uppercase">
                          {imovel.modalidade}
                        </span>
                      </div>

                      {imovel.imagens.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-amber-600/40 px-2.5 py-1 rounded-lg text-[11px] font-black text-amber-300 z-10">
                          📸 {imovel.imagens.length} fotos
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-amber-500 font-extrabold">
                            📍 {imovel.bairro}, {imovel.cidade} - {imovel.estado}
                          </span>
                          <span className="bg-black border border-amber-600/20 px-2.5 py-1 rounded-md text-amber-200/80">
                            {imovel.tipo}
                          </span>
                        </div>
                        <h3 className="font-black text-amber-100 text-lg line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {imovel.titulo}
                        </h3>

                        <p className="text-[11px] text-neutral-400 mt-1 font-semibold flex items-center gap-1">
                          <span>👤 Anunciante:</span>
                          <strong className="text-amber-300">{imovel.corretor.nome}</strong>
                        </p>

                        <div className="grid grid-cols-4 gap-1 text-[11px] text-amber-200/70 mt-3 font-bold bg-black/50 p-2.5 rounded-2xl border border-amber-600/20 text-center">
                          <div>🛏️ {imovel.quartos} qts</div>
                          <div>🚿 {imovel.banheiros} ban</div>
                          <div>🚗 {imovel.vagas} vag</div>
                          <div>📐 {imovel.areaUtil}m²</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-black uppercase">
                            {isTemporada ? "Valor da Diária" : "Valor de Venda"}
                          </span>
                          <span className="text-xl font-black text-amber-400">
                            {formatarPreco(imovel)}
                          </span>
                        </div>
                        <a
                          href={gerarLinkWhatsAppCorretor(imovel)}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-2xl text-xs font-extrabold"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE DETALHES COM GALERIA COMPLETA DE FOTOS */}
      {imovelSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-600/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-neutral-100">
            <button
              onClick={() => setImovelSelecionado(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black border border-amber-600/30 font-bold text-amber-400 hover:bg-neutral-800 transition flex items-center justify-center z-20"
            >
              ✕
            </button>

            {/* FOTO PRINCIPAL COM SETAS DE NAVEGAÇÃO */}
            <div className="relative aspect-[16/10] bg-black rounded-2xl overflow-hidden shadow-2xl border border-amber-600/30 group">
              <img
                src={imovelSelecionado.imagens[fotoAtivaIndex]}
                alt={`${imovelSelecionado.titulo} - Foto ${fotoAtivaIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Botões de Navegação Anterior/Próxima */}
              {imovelSelecionado.imagens.length > 1 && (
                <>
                  <button
                    onClick={fotoAnterior}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-amber-600 text-white hover:text-black font-black flex items-center justify-center border border-amber-600/40 transition shadow-lg"
                  >
                    ◀
                  </button>
                  <button
                    onClick={proximaFoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-amber-600 text-white hover:text-black font-black flex items-center justify-center border border-amber-600/40 transition shadow-lg"
                  >
                    ▶
                  </button>
                </>
              )}

              {/* Indicador de Quantidade */}
              <div className="absolute bottom-3 right-3 bg-black/80 border border-amber-600/40 px-3 py-1 rounded-full text-xs font-black text-amber-300 shadow">
                📸 {fotoAtivaIndex + 1} de {imovelSelecionado.imagens.length}
              </div>
            </div>

            {/* MINIATURAS CLICÁVEIS */}
            {imovelSelecionado.imagens.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                {imovelSelecionado.imagens.map((foto, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFotoAtivaIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      fotoAtivaIndex === idx
                        ? "border-amber-500 scale-105 shadow-md shadow-amber-600/30"
                        : "border-neutral-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={foto} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-black border border-amber-600/40 text-amber-400 text-[11px] font-black px-3 py-1 rounded-lg">
                  REF: {imovelSelecionado.codigo}
                </span>
                <span className="text-[11px] font-black px-3 py-1 rounded-lg bg-amber-400 text-black uppercase">
                  {imovelSelecionado.modalidade}
                </span>
              </div>
              <h2 className="text-2xl font-black text-amber-400 mt-3">{imovelSelecionado.titulo}</h2>
              <p className="text-xs text-amber-200/80 font-extrabold mt-1">
                📍 {imovelSelecionado.bairro}, {imovelSelecionado.cidade} - {imovelSelecionado.estado} • {imovelSelecionado.tipo}
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
              <div className="bg-black/60 p-3 rounded-2xl border border-amber-600/20">
                🛏️ {imovelSelecionado.quartos} Quartos
              </div>
              <div className="bg-black/60 p-3 rounded-2xl border border-amber-600/20">
                🚿 {imovelSelecionado.banheiros} Banheiros
              </div>
              <div className="bg-black/60 p-3 rounded-2xl border border-amber-600/20">
                🚗 {imovelSelecionado.vagas} Vagas
              </div>
              <div className="bg-black/60 p-3 rounded-2xl border border-amber-600/20">
                📐 {imovelSelecionado.areaUtil} m²
              </div>
            </div>

            <div className="bg-black border border-amber-600/30 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[10px] text-amber-500 font-black tracking-widest block uppercase">
                  Imobiliária / Corretor Responsável
                </span>
                <span className="font-extrabold text-white text-base">
                  {imovelSelecionado.corretor.nome}
                </span>
                <span className="text-xs text-neutral-400 block">
                  CRECI: {imovelSelecionado.corretor.creci}
                </span>
              </div>
              <a
                href={gerarLinkWhatsAppCorretor(imovelSelecionado)}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl text-xs font-extrabold transition shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                💬 Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}