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
  const [precoMaximo, setPrecoMaximo] = useState<number>(2000000);
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center space-x-2.5 shrink-0 whitespace-nowrap">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
              🏰
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-none">
                ESFINGE
              </span>
              <span className="text-amber-600 text-[10px] sm:text-[11px] font-bold mt-1 tracking-wider uppercase">
                GUARDIÃO DE IMÓVEIS
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 whitespace-nowrap">
            <a
              href="/admin"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-600 px-3.5 py-2 rounded-full hover:bg-slate-100 transition"
            >
              <span>👨‍💼 Área do Corretor</span>
            </a>
            <a
              href="https://wa.me/5544997278694"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow transition inline-flex items-center justify-center"
            >
              <span>💬 Falar no WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaSelecionada(cat.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  categoriaSelecionada === cat.id
                    ? "bg-slate-900 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/2 relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Busque por código, bairro, cidade ou título..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 text-slate-900 font-medium"
              />
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <select
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value as any)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 font-bold text-slate-900"
              >
                <option value="Todos">Todas Modalidades</option>
                <option value="Venda">Venda</option>
                <option value="Aluguel">Aluguel</option>
              </select>
              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 font-bold text-slate-900"
              >
                <option value="Todas">Todas as Cidades</option>
                <option value="Maringá">Maringá</option>
                <option value="Pontal do Paraná">Pontal do Paraná</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={apenasPet}
                onChange={(e) => setApenasPet(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4"
              />
              <span>🐾 Pet Friendly</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={apenasAr}
                onChange={(e) => setApenasAr(e.target.checked)}
                className="rounded accent-amber-500 w-4 h-4"
              />
              <span>❄️ Ar-Condicionado</span>
            </label>
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-slate-400">Até R$ {precoMaximo.toLocaleString("pt-BR")}</span>
              <input
                type="range"
                min="100000"
                max="3000000"
                step="50000"
                value={precoMaximo}
                onChange={(e) => setPrecoMaximo(Number(e.target.value))}
                className="accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Imóveis Selecionados
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Exibindo <span className="font-bold text-amber-600">{imoveisFiltrados.length}</span> imóveis sob a guarda da Esfinge
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Carregando vitrine de imóveis...</div>
        ) : imoveisFiltrados.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200">
            <p className="text-base font-bold text-slate-700">Nenhum imóvel encontrado com esses filtros.</p>
            <button
              onClick={() => {
                setBuscaTexto("");
                setCategoriaSelecionada("Todos");
                setModalidade("Todos");
                setCidade("Todas");
                setApenasPet(false);
                setApenasAr(false);
                setPrecoMaximo(2000000);
              }}
              className="mt-3 bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveisFiltrados.map((imovel) => {
              const isFav = favoritos.includes(imovel.id);
              return (
                <div
                  key={imovel.id}
                  onClick={() => {
                    setImovelSelecionado(imovel);
                    setFotoIndex(0);
                  }}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={imovel.imagens && imovel.imagens[0] ? imovel.imagens[0] : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                      alt={imovel.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => toggleFavorito(imovel.id, e)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-lg hover:scale-110 transition shadow"
                    >
                      {isFav ? "❤️" : "🤍"}
                    </button>
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                        REF: {imovel.codigo}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md text-white uppercase ${imovel.modalidade === 'Venda' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                        {imovel.modalidade}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                        <span>📍 {imovel.bairro}, {imovel.cidade}</span>
                        <span className="font-semibold text-slate-400">{imovel.tipo}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {imovel.titulo}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-medium">
                        <span>🛏️ {imovel.quartos} qts</span>
                        <span>🚿 {imovel.banheiros} ban</span>
                        <span>🚗 {imovel.vagas} vag</span>
                        <span>📐 {imovel.areaUtil} m²</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Valor</span>
                        <span className="text-lg font-extrabold text-slate-900">
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
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition shadow flex items-center justify-center text-xs font-bold space-x-1"
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

      {imovelSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setImovelSelecionado(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 font-bold hover:bg-slate-200 transition"
            >
              ✕
            </button>
            <div className="relative aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden">
              <img
                src={imovelSelecionado.imagens[fotoIndex] || imovelSelecionado.imagens[0]}
                alt={imovelSelecionado.titulo}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                REF: {imovelSelecionado.codigo}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">{imovelSelecionado.titulo}</h2>
              <p className="text-xs text-slate-500 mt-1">📍 {imovelSelecionado.bairro}, {imovelSelecionado.cidade} • {imovelSelecionado.tipo}</p>
              <p className="text-2xl font-black text-amber-600 mt-2">
                R$ {Number(imovelSelecionado.preco).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100 text-center text-xs font-bold text-slate-700">
              <div className="bg-slate-50 p-2.5 rounded-xl">🛏️ {imovelSelecionado.quartos} Quartos</div>
              <div className="bg-slate-50 p-2.5 rounded-xl">🚿 {imovelSelecionado.banheiros} Banheiros</div>
              <div className="bg-slate-50 p-2.5 rounded-xl">🚗 {imovelSelecionado.vagas} Vagas</div>
              <div className="bg-slate-50 p-2.5 rounded-xl">📐 {imovelSelecionado.areaUtil} m²</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Corretor Responsável</span>
                <span className="font-bold text-slate-900 text-sm">{imovelSelecionado.corretor.nome}</span>
                <span className="text-xs text-slate-500 block">CRECI: {imovelSelecionado.corretor.creci}</span>
              </div>
              <a
                href={`https://wa.me/55${imovelSelecionado.corretor.telefone}?text=${encodeURIComponent(
                  `Olá ${imovelSelecionado.corretor.nome}! Tenho interesse no imóvel ${imovelSelecionado.titulo} (Ref: ${imovelSelecionado.codigo})`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
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