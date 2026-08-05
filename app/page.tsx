"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export interface Imovel {
  id: number | string;
  codigo: string;
  titulo: string;
  tipo: string;
  cidade: string;
  bairro: string;
  modalidade: "Venda" | "Aluguel" | string;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  areaUtil: number;
  aceitaPet: boolean;
  arCondicionado: boolean;
  imagens: string[];
  corretor: {
    nome: string;
    creci: string;
    telefone: string;
  };
  destaque?: boolean;
}

const IMOVEIS_INICIAIS: Imovel[] = [
  {
    id: 1,
    codigo: "ESF-101",
    titulo: "Sobrado Moderno em Condomínio Fechado",
    tipo: "Sobrado",
    cidade: "Maringá",
    bairro: "Zona 03",
    modalidade: "Venda",
    preco: 980000,
    quartos: 3,
    banheiros: 3,
    vagas: 2,
    areaUtil: 210,
    aceitaPet: true,
    arCondicionado: true,
    imagens: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    ],
    corretor: {
      nome: "Carlos Eduardo",
      creci: "PR-45920",
      telefone: "44997278694",
    },
    destaque: true,
  },
  {
    id: 2,
    codigo: "ESF-102",
    titulo: "Apartamento Alto Padrão Frente para o Mar",
    tipo: "Apartamento",
    cidade: "Pontal do Paraná",
    bairro: "Praia de Leste",
    modalidade: "Venda",
    preco: 1250000,
    quartos: 4,
    banheiros: 4,
    vagas: 3,
    areaUtil: 185,
    aceitaPet: true,
    arCondicionado: true,
    imagens: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    ],
    corretor: {
      nome: "Juliana Silva",
      creci: "PR-38190",
      telefone: "44997278694",
    },
    destaque: true,
  },
  {
    id: 3,
    codigo: "ESF-103",
    titulo: "Studio Compacto & Mobiliado no Centro",
    tipo: "Studio",
    cidade: "Maringá",
    bairro: "Centro",
    modalidade: "Aluguel",
    preco: 2200,
    quartos: 1,
    banheiros: 1,
    vagas: 1,
    areaUtil: 45,
    aceitaPet: false,
    arCondicionado: true,
    imagens: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    corretor: {
      nome: "Carlos Eduardo",
      creci: "PR-45920",
      telefone: "44997278694",
    },
  },
];

const CATEGORIAS = [
  { id: "Todos", label: "Todos", icon: "✨" },
  { id: "Casa", label: "Casas", icon: "🏠" },
  { id: "Apartamento", label: "Apartamentos", icon: "🏢" },
  { id: "Sobrado", label: "Sobrados", icon: "🏡" },
  { id: "Studio", label: "Studios", icon: "🛋️" },
  { id: "Chácara", label: "Chácaras", icon: "🌾" },
];

export default function Home() {
  const [imoveis, setImoveis] = useState<Imovel[]>(IMOVEIS_INICIAIS);
  const [loading, setLoading] = useState(true);

  const [buscaTexto, setBuscaTexto] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [modalidade, setModalidade] = useState<"Todos" | "Venda" | "Aluguel">("Todos");
  const [cidade, setCidade] = useState("Todas");
  const [apenasPet, setApenasPet] = useState(false);
  const [apenasAr, setApenasAr] = useState(false);
  const [precoMaximo, setPrecoMaximo] = useState<number>(3000000);
  const [favoritos, setFavoritos] = useState<(number | string)[]>([]);

  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [fotoIndex, setFotoIndex] = useState(0);

  useEffect(() => {
    async function carregarImoveisPublicos() {
      try {
        const { data, error } = await supabase.from("imoveis").select("*");
        if (!error && data && data.length > 0) {
          const formatados: Imovel[] = data.map((item: any) => ({
            id: item.id,
            codigo: item.codigo || "ESF-000",
            titulo: item.titulo || "Imóvel Esfinge",
            tipo: item.tipo || "Casa",
            cidade: item.cidade || "Maringá",
            bairro: item.bairro || "Centro",
            modalidade: item.modalidade || "Venda",
            preco: Number(item.preco) || 500000,
            quartos: Number(item.quartos) || 3,
            banheiros: Number(item.banheiros) || 2,
            vagas: Number(item.vagas) || 2,
            areaUtil: Number(item.area_util) || 120,
            aceitaPet: item.aceita_pet ?? true,
            arCondicionado: item.ar_condicionado ?? true,
            imagens: item.imagens && item.imagens.length > 0 ? item.imagens : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
            corretor: {
              nome: "Carlos Eduardo",
              creci: "PR-45920",
              telefone: "44997278694",
            },
            destaque: item.destaque || false,
          }));
          setImoveis(formatados);
        }
      } catch (err) {
        console.error("Usando dados locais de fallback", err);
      } finally {
        setLoading(false);
      }
    }
    carregarImoveisPublicos();
  }, []);

  const toggleFavorito = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
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

      if (categoriaSelecionada !== "Todos" && imovel.tipo !== categoriaSelecionada) {
        return false;
      }

      if (modalidade !== "Todos" && imovel.modalidade !== modalidade) return false;
      if (cidade !== "Todas" && imovel.cidade !== cidade) return false;
      if (imovel.preco > precoMaximo) return false;
      if (apenasPet && !imovel.aceitaPet) return false;
      if (apenasAr && !imovel.arCondicionado) return false;

      return true;
    });
  }, [imoveis, buscaTexto, categoriaSelecionada, modalidade, cidade, precoMaximo, apenasPet, apenasAr]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <div>
        {/* HEADER VIBRANTE */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center space-x-3 shrink-0 whitespace-nowrap">
              <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20 shrink-0">
                🏰
              </div>
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-black text-xl text-white tracking-tight leading-none">
                  ESFINGE
                </span>
                <span className="text-amber-400 text-[11px] font-extrabold mt-1 tracking-widest uppercase">
                  GUARDIÃO DE IMÓVEIS
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 whitespace-nowrap">
              <a
                href="/admin"
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-amber-400 px-4 py-2 rounded-full hover:bg-slate-800 transition border border-slate-800"
              >
                <span>👨‍💼 Área do Corretor</span>
              </a>
              <a
                href="https://wa.me/5544997278694"
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/20 transition inline-flex items-center justify-center space-x-1.5"
              >
                <span>💬</span>
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 bg-slate-900/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSelecionada(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    categoriaSelecionada === cat.id
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-amber-500/30 scale-105"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 pb-16">
          {/* PAINEL DE FILTROS VIBRANTE */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-1/2 relative">
                <span className="absolute left-4 top-3.5 text-amber-600 font-bold">🔍</span>
                <input
                  type="text"
                  placeholder="Busque por código, bairro, cidade ou título..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 font-semibold transition"
                />
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value as any)}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 font-extrabold text-slate-900 cursor-pointer shadow-sm"
                >
                  <option value="Todos">Todas Modalidades</option>
                  <option value="Venda">Venda</option>
                  <option value="Aluguel">Aluguel</option>
                </select>
                <select
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 font-extrabold text-slate-900 cursor-pointer shadow-sm"
                >
                  <option value="Todas">Todas as Cidades</option>
                  <option value="Maringá">Maringá</option>
                  <option value="Pontal do Paraná">Pontal do Paraná</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-xs font-bold text-slate-700">
              <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200/60 transition">
                <input
                  type="checkbox"
                  checked={apenasPet}
                  onChange={(e) => setApenasPet(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>🐾 Pet Friendly</span>
              </label>
              <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200/60 transition">
                <input
                  type="checkbox"
                  checked={apenasAr}
                  onChange={(e) => setApenasAr(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>❄️ Ar-Condicionado</span>
              </label>
              <div className="flex items-center space-x-3 ml-auto bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 font-bold">Até R$ {precoMaximo.toLocaleString("pt-BR")}</span>
                <input
                  type="range"
                  min="200000"
                  max="3000000"
                  step="50000"
                  value={precoMaximo}
                  onChange={(e) => setPrecoMaximo(Number(e.target.value))}
                  className="accent-amber-500 cursor-pointer w-32 sm:w-48"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Imóveis Selecionados</span>
                <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-3 py-1 rounded-full border border-amber-200">
                  {imoveisFiltrados.length} disponíveis
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sob a guarda exclusiva da Esfinge | Maringá & Litoral do Paraná
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-24 text-slate-400 font-bold text-base">Carregando vitrine de imóveis...</div>
          ) : imoveisFiltrados.length === 0 ? (
            <div className="text-center py-28 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="text-4xl">🏰</div>
              <p className="text-base font-bold text-slate-700">Nenhum imóvel encontrado com esses filtros.</p>
              <button
                onClick={() => {
                  setBuscaTexto("");
                  setCategoriaSelecionada("Todos");
                  setModalidade("Todos");
                  setCidade("Todas");
                  setApenasPet(false);
                  setApenasAr(false);
                  setPrecoMaximo(3000000);
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition shadow-md"
              >
                Limpar Filtros e Ver Todos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {imoveisFiltrados.map((imovel) => {
                const isFav = favoritos.includes(imovel.id);
                return (
                  <div
                    key={imovel.id}
                    onClick={() => {
                      setImovelSelecionado(imovel);
                      setFotoIndex(0);
                    }}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                      <img
                        src={imovel.imagens && imovel.imagens[0] ? imovel.imagens[0] : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                        alt={imovel.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition"></div>
                      
                      <button
                        onClick={(e) => toggleFavorito(imovel.id, e)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-lg hover:scale-110 transition shadow-lg z-10"
                      >
                        {isFav ? "❤️" : "🤍"}
                      </button>

                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-10">
                        <span className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow">
                          REF: {imovel.codigo}
                        </span>
                        <span className={`text-[11px] font-black px-3 py-1 rounded-lg text-slate-950 uppercase tracking-wider shadow ${imovel.modalidade === 'Venda' ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-gradient-to-r from-blue-400 to-cyan-400'}`}>
                          {imovel.modalidade}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                          <span className="text-amber-600 font-extrabold">📍 {imovel.bairro}, {imovel.cidade}</span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">{imovel.tipo}</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-lg line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {imovel.titulo}
                        </h3>
                        <div className="grid grid-cols-4 gap-1 text-[11px] text-slate-600 mt-3 font-bold bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                          <div>🛏️ {imovel.quartos} qts</div>
                          <div>🚿 {imovel.banheiros} ban</div>
                          <div>🚗 {imovel.vagas} vag</div>
                          <div>📐 {imovel.areaUtil}m²</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-black uppercase tracking-wider">Valor do Imóvel</span>
                          <span className="text-xl font-black text-slate-900">
                            R$ {Number(imovel.preco).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <a
                          href={`https://wa.me/55${imovel.corretor.telefone}?text=${encodeURIComponent(
                            `Olá! Gostaria de mais informações sobre o imóvel ${imovel.titulo} (Ref: ${imovel.codigo})`
                          )}`}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center text-xs font-extrabold space-x-1"
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
        </main>
      </div>

      {/* RODAPÉ PROFISSIONAL & VIBRANTE */}
      <footer className="bg-slate-950 text-slate-300 border-t border-amber-500/20 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                  🏰
                </div>
                <span className="font-black text-xl text-white tracking-tight">ESFINGE IMÓVEIS</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                O guardião definitivo dos seus melhores negócios imobiliários. Especialistas em imóveis de alto padrão, sobrados em condomínios fechados em Maringá e residências exclusivas no Litoral do Paraná.
              </p>
              <div className="text-xs text-amber-400 font-bold">
                CRECI Jurídico: J-07890 | Atendimento de Excelência
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2">Navegação</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li><a href="/" className="hover:text-amber-400 transition">Vitrine de Imóveis</a></li>
                <li><a href="/admin" className="hover:text-amber-400 transition">Área do Corretor / Admin</a></li>
                <li><a href="https://wa.me/5544997278694" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition">Atendimento via WhatsApp</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-2">Regiões de Atuação</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-400">
                <li>📍 Maringá e Região Metropolitana (Zona 01, Zona 03, Zona 07)</li>
                <li>🌊 Litoral do Paraná (Pontal do Paraná, Praia de Leste, Shangri-lá)</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Esfinge Imóveis. Todos os direitos reservados.</p>
            <p className="text-amber-500/80 font-bold">Guardião dos Melhores Negócios Imobiliários 🛡️</p>
          </div>
        </div>
      </footer>

      {/* MODAL DE DETALHES DO IMÓVEL */}
      {imovelSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setImovelSelecionado(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition flex items-center justify-center"
            >
              ✕
            </button>
            <div className="relative aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
              <img
                src={imovelSelecionado.imagens[fotoIndex] || imovelSelecionado.imagens[0]}
                alt={imovelSelecionado.titulo}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                  REF: {imovelSelecionado.codigo}
                </span>
                <span className={`text-[11px] font-black px-3 py-1 rounded-lg text-slate-950 uppercase tracking-wider ${imovelSelecionado.modalidade === 'Venda' ? 'bg-amber-400' : 'bg-blue-400'}`}>
                  {imovelSelecionado.modalidade}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-3">{imovelSelecionado.titulo}</h2>
              <p className="text-xs text-amber-600 font-extrabold mt-1">📍 {imovelSelecionado.bairro}, {imovelSelecionado.cidade} • {imovelSelecionado.tipo}</p>
              <p className="text-3xl font-black text-slate-900 mt-3">
                R$ {Number(imovelSelecionado.preco).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 text-center text-xs font-black text-slate-700">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">🛏️ {imovelSelecionado.quartos} Quartos</div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">🚿 {imovelSelecionado.banheiros} Banheiros</div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">🚗 {imovelSelecionado.vagas} Vagas</div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">📐 {imovelSelecionado.areaUtil} m²</div>
            </div>
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-[10px] text-amber-400 font-black tracking-widest block uppercase">Corretor Responsável</span>
                <span className="font-extrabold text-white text-base">{imovelSelecionado.corretor.nome}</span>
                <span className="text-xs text-slate-400 block">CRECI: {imovelSelecionado.corretor.creci}</span>
              </div>
              <a
                href={`https://wa.me/55${imovelSelecionado.corretor.telefone}?text=${encodeURIComponent(
                  `Olá ${imovelSelecionado.corretor.nome}! Tenho interesse no imóvel ${imovelSelecionado.titulo} (Ref: ${imovelSelecionado.codigo})`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3.5 rounded-xl text-xs font-extrabold transition shadow-lg shadow-emerald-500/30 flex items-center gap-2 w-full sm:w-auto justify-center"
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