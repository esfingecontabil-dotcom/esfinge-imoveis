"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export interface Imovel {
  id: number | string;
  codigo: string;
  titulo: string;
  tipo: string;
  cidade: string;
  bairro: string;
  modalidade: "Venda" | "Aluguel" | "Veraneio";
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

export interface ImobiliariaParceira {
  id: number | string;
  nome: string;
  logo: string;
  cidade: string;
  telefone: string;
  site: string;
  descricao: string;
  creci: string;
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
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
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
    modalidade: "Veraneio",
    preco: 1250000,
    quartos: 4,
    banheiros: 4,
    vagas: 3,
    areaUtil: 185,
    aceitaPet: true,
    arCondicionado: true,
    imagens: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ],
    corretor: {
      nome: "Carlos Eduardo",
      creci: "PR-45920",
      telefone: "44997278694",
    },
  },
  {
    id: 4,
    codigo: "ESF-104",
    titulo: "Casa Ampla com Piscina e Área Gourmet",
    tipo: "Casa",
    cidade: "Maringá",
    bairro: "Jardim Alvorada",
    modalidade: "Venda",
    preco: 750000,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    areaUtil: 160,
    aceitaPet: true,
    arCondicionado: true,
    imagens: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    ],
    corretor: {
      nome: "Juliana Silva",
      creci: "PR-38190",
      telefone: "44997278694",
    },
  },
  {
    id: 5,
    codigo: "ESF-105",
    titulo: "Chácara de Lazer com Riacho e Pomar",
    tipo: "Chácara",
    cidade: "Maringá",
    bairro: "Zona Rural",
    modalidade: "Venda",
    preco: 620000,
    quartos: 2,
    banheiros: 2,
    vagas: 4,
    areaUtil: 350,
    aceitaPet: true,
    arCondicionado: false,
    imagens: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
    ],
    corretor: {
      nome: "Carlos Eduardo",
      creci: "PR-45920",
      telefone: "44997278694",
    },
  },
];

const IMOBILIARIAS_INICIAIS: ImobiliariaParceira[] = [
  {
    id: 1,
    nome: "Esfinge Contabilidade & Negócios",
    logo: "",
    cidade: "Maringá & Matinhos / Pontal do Paraná",
    telefone: "44997278694",
    site: "https://esfingecontabilidade.com.br",
    descricao: "Guardiã oficial de patrimônios, assessoria contábil e transações imobiliárias.",
    creci: "J-06540"
  }
];

const CATEGORIAS = [
  { id: "Todos", label: "Todos", icon: "🏛️" },
  { id: "Casa", label: "Casas", icon: "🏠" },
  { id: "Apartamento", label: "Apartamentos", icon: "🏢" },
  { id: "Sobrado", label: "Sobrados", icon: "🏡" },
  { id: "Studio", label: "Studios", icon: "🛋️" },
  { id: "Chácara", label: "Chácaras", icon: "🌾" },
  { id: "Comercial", label: "Comercial", icon: "💼" },
];

export default function Home() {
  const [listaImoveis, setListaImoveis] = useState<Imovel[]>(IMOVEIS_INICIAIS);
  const [listaImobiliarias, setListaImobiliarias] = useState<ImobiliariaParceira[]>(IMOBILIARIAS_INICIAIS);
  const [abaSecao, setAbaSecao] = useState<"imoveis" | "parceiras">("imoveis");

  const [buscaTexto, setBuscaTexto] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [modalidade, setModalidade] = useState<string>("Todos");
  const [cidade, setCidade] = useState("Todas");
  const [apenasPet, setApenasPet] = useState(false);
  const [apenasAr, setApenasAr] = useState(false);
  const [precoMaximo, setPrecoMaximo] = useState<number>(2000000);
  const [favoritos, setFavoritos] = useState<(number | string)[]>([]);

  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [fotoIndex, setFotoIndex] = useState(0);

  // Estados do formulário de lead no modal
  const [leadNome, setLeadNome] = useState("");
  const [leadTelefone, setLeadTelefone] = useState("");
  const [leadMsg, setLeadMsg] = useState("");

  useEffect(() => {
    async function carregarDadosPublicos() {
      try {
        const { data: corrData } = await supabase.from("corretores").select("*");

        const { data: imvData } = await supabase.from("imoveis").select("*");
        if (imvData && imvData.length > 0) {
          const formatados: Imovel[] = imvData.map((item: any) => {
            const corrEncontrado = corrData?.find((c: any) => String(c.id) === String(item.corretor_id));
            return {
              id: item.id,
              codigo: item.codigo,
              titulo: item.titulo,
              tipo: item.tipo,
              cidade: item.cidade || "Maringá",
              bairro: item.bairro,
              modalidade: item.modalidade || "Venda",
              preco: Number(item.preco),
              quartos: item.quartos || 0,
              banheiros: item.banheiros || 0,
              vagas: item.vagas || 0,
              areaUtil: item.area_util || 100,
              aceitaPet: item.aceita_pet ?? true,
              arCondicionado: item.ar_condicionado ?? true,
              imagens: item.imagens && item.imagens.length > 0 ? item.imagens : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
              corretor: corrEncontrado ? {
                nome: corrEncontrado.nome,
                creci: corrEncontrado.creci,
                telefone: corrEncontrado.telefone
              } : {
                nome: "Carlos Eduardo",
                creci: "PR-45920",
                telefone: "44997278694"
              },
              destaque: item.destaque || false
            };
          });
          setListaImoveis([...formatados, ...IMOVEIS_INICIAIS]);
        }

        const { data: imbData } = await supabase.from("imobiliarias").select("*");
        if (imbData && imbData.length > 0) {
          setListaImobiliarias([...imbData, ...IMOBILIARIAS_INICIAIS]);
        }
      } catch (err) {
        console.log("Usando dados locais de fallback.");
      }
    }
    carregarDadosPublicos();
  }, []);

  const cidadesDisponiveis = useMemo(() => {
    const setCidades = new Set(listaImoveis.map(i => i.cidade).filter(Boolean));
    return Array.from(setCidades).sort();
  }, [listaImoveis]);

  const toggleFavorito = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const imoveisFiltrados = useMemo(() => {
    return listaImoveis.filter((imovel) => {
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
  }, [listaImoveis, buscaTexto, categoriaSelecionada, modalidade, cidade, precoMaximo, apenasPet, apenasAr]);

  return (
    <div className="min-h-screen bg-[#0c0a09] font-sans text-stone-200 pb-20 selection:bg-amber-600 selection:text-white">
      
      {/* FAIXA GREGA SUPERIOR */}
      <div className="w-full h-3 bg-gradient-to-r from-[#b94a2b] via-[#d47244] to-[#b94a2b] border-b border-amber-500/40"></div>

      {/* HEADER PRINCIPAL */}
      <header className="sticky top-0 z-40 bg-[#120f0e]/95 backdrop-blur-md border-b border-amber-600/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3 shrink-0 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="w-11 h-11 bg-gradient-to-br from-[#b94a2b] via-[#913217] to-[#120f0e] rounded-2xl flex items-center justify-center text-amber-400 shadow-xl border-2 border-amber-500/50 group-hover:scale-105 transition">
              <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 14h-2.1c-.5-1.2-1.4-2.2-2.6-2.7l1.1-2.4c.3-.6-.1-1.3-.8-1.4l-3-.6c-.5-.1-1 .2-1.1.7l-.6 2.4C9.3 10.3 8.3 11 7.3 11H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm-14 3v-2h2v2H5zm4 0v-2h2v2H9zm4 0v-2h2v2h-2z"/>
                <path d="M12 3c-1.7 0-3 1.3-3 3 0 .8.3 1.5.8 2 .3.3.4.8.2 1.2l-.7 1.7c-.3.7.2 1.5.9 1.5h4c.7 0 1.2-.8.9-1.5l-.7-1.7c-.2-.4-.1-.9.2-1.2.5-.5.8-1.2.8-2 0-1.7-1.3-3-3-3z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider text-amber-400 leading-none">
                ESFINGE
              </span>
              <span className="text-stone-400 text-[9px] font-extrabold mt-1 tracking-widest uppercase">
                Guardião de Imóveis
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center bg-[#1c1817] border border-amber-600/30 shadow-lg rounded-full px-4 py-2 transition-all space-x-3 divide-x divide-stone-800 shrink max-w-xl">
            <input
              type="text"
              placeholder="Bairro, cidade ou cód (ESF-101)..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="bg-transparent text-sm focus:outline-none w-48 xl:w-60 text-stone-200 placeholder:text-stone-500 pl-1"
            />
            <div className="pl-3 shrink-0">
              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-stone-300"
              >
                <option value="Todas" className="bg-[#1c1817]">Todas Cidades</option>
                {cidadesDisponiveis.map((c) => (
                  <option key={c} value={c} className="bg-[#1c1817]">{c}</option>
                ))}
              </select>
            </div>
            <div className="pl-3 shrink-0">
              <select
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                className="bg-transparent text-xs focus:outline-none cursor-pointer text-amber-400 font-bold"
              >
                <option value="Todos" className="bg-[#1c1817]">Modalidades</option>
                <option value="Venda" className="bg-[#1c1817]">Venda</option>
                <option value="Aluguel" className="bg-[#1c1817]">Aluguel</option>
                <option value="Veraneio" className="bg-[#1c1817]">Veraneio</option>
              </select>
            </div>
            <div className="pl-2 shrink-0">
              <button
                type="button"
                className="w-8 h-8 bg-gradient-to-br from-[#b94a2b] to-[#80311a] text-amber-300 rounded-full flex items-center justify-center shadow transition text-xs font-bold"
              >
                🔍
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <a
              href="/admin"
              className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-stone-300 hover:text-amber-400 px-3 sm:px-4 py-2 rounded-full hover:bg-stone-900 transition whitespace-nowrap border border-stone-800"
            >
              <span>🏛️ Portal do Corretor</span>
            </a>
            <a
              href="https://wa.me/5544997278694"
              target="_blank"
              rel="noreferrer"
              className="bg-gradient-to-r from-[#b94a2b] to-[#913217] text-white text-xs sm:text-sm font-bold px-4 py-2 sm:py-2.5 rounded-full shadow-lg transition inline-flex items-center space-x-1.5 whitespace-nowrap border border-amber-600/30"
            >
              <span>💬 WhatsApp</span>
            </a>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS & CATEGORIAS */}
        <div className="border-t border-stone-800 bg-[#161312]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between overflow-x-auto no-scrollbar space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAbaSecao("imoveis")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${abaSecao === "imoveis" ? "bg-amber-500 text-stone-950 shadow" : "bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200"}`}
              >
                🏠 Acervo de Imóveis
              </button>
              <button
                onClick={() => setAbaSecao("parceiras")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${abaSecao === "parceiras" ? "bg-amber-500 text-stone-950 shadow" : "bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200"}`}
              >
                🏢 Rede de Imobiliárias Parceiras ({listaImobiliarias.length})
              </button>
            </div>

            {abaSecao === "imoveis" && (
              <div className="hidden lg:flex items-center space-x-2">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSelecionada(cat.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition ${
                      categoriaSelecionada === cat.id
                        ? "bg-amber-500 text-stone-950 font-bold shadow"
                        : "bg-[#221e1c] text-stone-300 hover:bg-stone-800 border border-stone-800"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SEARCH MOBILE */}
      <div className="lg:hidden px-4 pt-4">
        <div className="bg-[#161312] rounded-2xl p-3 shadow-lg border border-stone-800 space-y-2">
          <input
            type="text"
            placeholder="Bairro, cidade ou cód (ESF-101)..."
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
            className="w-full text-sm bg-[#1c1817] border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
          />
          <div className="flex space-x-2">
            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-1/2 text-xs bg-[#1c1817] border border-stone-800 rounded-xl px-2 py-2 text-stone-300 font-medium"
            >
              <option value="Todas">Todas Cidades</option>
              {cidadesDisponiveis.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              className="w-1/2 text-xs bg-[#1c1817] border border-stone-800 rounded-xl px-2 py-2 text-amber-400 font-bold"
            >
              <option value="Todos">Modalidades</option>
              <option value="Venda">Venda</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Veraneio">Veraneio</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {abaSecao === "imoveis" ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-800 mb-6 gap-2">
              <div>
                <h1 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
                  <span>🏛️</span> Acervo de Imóveis Protegidos
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                  Exibindo <span className="font-bold text-amber-400">{imoveisFiltrados.length}</span> propriedades sob a guarda da Esfinge
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-[#161312] px-4 py-2 rounded-2xl border border-stone-800 shadow-lg self-start sm:self-auto">
                <span className="text-xs font-semibold text-stone-400 whitespace-nowrap">
                  Até R$ {(precoMaximo / 1000).toLocaleString("pt-BR")}k
                </span>
                <input
                  type="range"
                  min={1000}
                  max={2000000}
                  step={50000}
                  value={precoMaximo}
                  onChange={(e) => setPrecoMaximo(Number(e.target.value))}
                  className="w-24 sm:w-32 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {imoveisFiltrados.length === 0 ? (
              <div className="text-center py-20 bg-[#161312] rounded-3xl border border-stone-800 shadow-xl">
                <div className="text-5xl mb-4">🏛️</div>
                <h3 className="text-lg font-bold text-stone-200">Nenhum imóvel encontrado no acervo</h3>
                <p className="text-sm text-stone-400 max-w-sm mx-auto mt-1">Ajuste seus parâmetros de busca ou limpe os filtros.</p>
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
                        setLeadNome("");
                        setLeadTelefone("");
                        setLeadMsg("");
                      }}
                      className="group bg-[#161312] rounded-3xl overflow-hidden border border-stone-800 hover:border-amber-600/50 shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] w-full bg-[#120f0e] overflow-hidden">
                        <img
                          src={imovel.imagens[0]}
                          alt={imovel.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                        <button
                          onClick={(e) => toggleFavorito(imovel.id, e)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#161312]/80 backdrop-blur-md flex items-center justify-center text-lg hover:scale-110 transition shadow border border-stone-700"
                        >
                          {isFav ? "❤️" : "🤍"}
                        </button>
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                          <span className="bg-stone-950/90 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border border-amber-500/30">
                            REF: {imovel.codigo}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md text-white uppercase tracking-wider ${
                            imovel.modalidade === "Venda" ? "bg-[#b94a2b]" : imovel.modalidade === "Veraneio" ? "bg-emerald-700" : "bg-blue-700"
                          }`}>
                            {imovel.modalidade}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 flex space-x-1">
                          {imovel.aceitaPet && (
                            <span className="bg-stone-950/80 backdrop-blur-sm text-stone-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-stone-700">🐾 Pet</span>
                          )}
                          {imovel.arCondicionado && (
                            <span className="bg-stone-950/80 backdrop-blur-sm text-stone-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-stone-700">❄️ Ar</span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-stone-400 font-medium mb-1">
                            <span>📍 {imovel.bairro}, {imovel.cidade}</span>
                            <span className="font-semibold text-amber-500/80">{imovel.tipo}</span>
                          </div>
                          <h3 className="font-bold text-stone-100 text-base line-clamp-1 group-hover:text-amber-400 transition-colors">
                            {imovel.titulo}
                          </h3>
                          <div className="grid grid-cols-4 gap-2 text-center my-3 bg-[#1c1817] p-2.5 rounded-2xl border border-stone-800 text-xs text-stone-300 font-medium">
                            <div><span className="block font-bold text-stone-100">{imovel.quartos}</span><span className="text-[10px] text-stone-500">Quartos</span></div>
                            <div><span className="block font-bold text-stone-100">{imovel.banheiros}</span><span className="text-[10px] text-stone-500">Banh.</span></div>
                            <div><span className="block font-bold text-stone-100">{imovel.vagas}</span><span className="text-[10px] text-stone-500">Vagas</span></div>
                            <div><span className="block font-bold text-stone-100">{imovel.areaUtil}m²</span><span className="text-[10px] text-stone-500">Útil</span></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-stone-800 mt-2">
                          <div>
                            <span className="text-[10px] text-stone-500 block font-semibold uppercase">
                              {imovel.modalidade === "Aluguel" ? "Aluguel Mensal" : imovel.modalidade === "Veraneio" ? "Temporada / Veraneio" : "Valor de Venda"}
                            </span>
                            <span className="text-lg font-extrabold text-amber-400">R$ {imovel.preco.toLocaleString("pt-BR")}</span>
                          </div>
                          <span className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl transition shadow text-xs font-bold whitespace-nowrap">
                            💬 Detalhes
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* SEÇÃO DE IMOBILIÁRIAS PARCEIRAS */
          <div className="space-y-6">
            <div className="pb-6 border-b border-stone-800">
              <h1 className="text-2xl font-black text-amber-400 tracking-tight flex items-center gap-2">
                <span>🏢</span> Rede de Imobiliárias Parceiras
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                Conheça as marcas, imobiliárias e escritórios aliados que integram o ecossistema da Esfinge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listaImobiliarias.map((imb) => (
                <div key={imb.id} className="bg-[#161312] border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-600/40 transition">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-[#1c1817] rounded-2xl overflow-hidden border border-stone-700 flex items-center justify-center font-bold text-amber-400 text-2xl shadow-inner">
                      {imb.logo ? <img src={imb.logo} alt={imb.nome} className="w-full h-full object-cover" /> : "🏢"}
                    </div>
                    <div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 rounded border border-amber-500/30 uppercase">
                        CRECI: {imb.creci || "Jurídico"}
                      </span>
                      <h3 className="text-lg font-black text-stone-100 mt-1.5">{imb.nome}</h3>
                      <p className="text-xs text-stone-400 mt-1">📍 Sede: {imb.cidade}</p>
                      <p className="text-xs text-stone-300 mt-3 italic">"{imb.descricao || "Parceiro oficial da rede Esfinge de imóveis."}"</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-2">
                    {imb.site && (
                      <a href={imb.site} target="_blank" rel="noreferrer" className="text-xs font-semibold text-stone-400 hover:text-amber-400 transition truncate">
                        Visitar Site ↗
                      </a>
                    )}
                    <a
                      href={`https://wa.me/55${imb.telefone}?text=${encodeURIComponent(`Olá, vi o perfil da ${imb.nome} no portal Esfinge e gostaria de contato.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-gradient-to-r from-[#b94a2b] to-[#80311a] text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition whitespace-nowrap"
                    >
                      Falar com Agência
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* RODAPÉ INSTITUCIONAL & AVISO LEGAL */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-stone-800 text-stone-400 text-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-stone-200 text-sm">VIP ARTE & ESTRATEGIAS LTDA</p>
            <p className="text-stone-400 mt-0.5">CNPJ: 12.225.613/0001-06 • Matinhos, Paraná</p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-bold text-amber-400 tracking-wide">ESFINGE | Guardião de Imóveis</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Todos os direitos reservados © {new Date().getFullYear()}</p>
          </div>
        </div>

        <div className="bg-[#161312] p-5 rounded-2xl border border-stone-800 text-[11px] leading-relaxed text-stone-400 text-center md:text-left shadow-inner">
          <p>
            <strong className="text-amber-400/90 font-bold uppercase tracking-wider">Aviso Legal: </strong> 
            Este site não realiza atividades de corretagem imobiliária. A corretagem e intermediação de transações são realizadas exclusivamente por corretores de imóveis credenciados e imobiliárias parceiras. Esta plataforma atua estritamente como ferramenta tecnológica de anúncio e encontro de imóveis, imobiliárias, proprietários e interessados, sob a guarda e proteção da Esfinge.
          </p>
        </div>
      </footer>

      {/* MODAL DE DETALHES COM ROLAGEM CORRIGIDA E BOTÃO FIXO */}
      {imovelSelecionado && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#161312] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-amber-600/40 my-auto no-scrollbar">
            
            {/* BOTÃO DE FECHAR FIXO (STICKY) NO TOPO DO MODAL */}
            <div className="sticky top-0 z-30 flex justify-end p-4 bg-[#161312]/95 backdrop-blur-md border-b border-stone-800">
              <button
                onClick={() => setImovelSelecionado(null)}
                className="w-10 h-10 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-200 flex items-center justify-center font-bold text-base transition border border-stone-700 shadow-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 pt-2 space-y-5">
              <div className="relative aspect-[16/9] w-full bg-[#120f0e] rounded-2xl overflow-hidden border border-stone-800">
                <img
                  src={imovelSelecionado.imagens[fotoIndex]}
                  alt={imovelSelecionado.titulo}
                  className="w-full h-full object-contain"
                />
                {imovelSelecionado.imagens.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
                    {imovelSelecionado.imagens.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFotoIndex(idx)}
                        className={`h-2.5 rounded-full transition-all ${
                          fotoIndex === idx ? "w-8 bg-amber-400" : "w-2.5 bg-stone-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#b94a2b]/30 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded border border-amber-600/40">
                      CÓDIGO: {imovelSelecionado.codigo}
                    </span>
                    <span className="text-xs font-semibold text-stone-400">
                      {imovelSelecionado.tipo} • {imovelSelecionado.cidade}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-stone-100 mt-1">
                    {imovelSelecionado.titulo}
                  </h2>
                  <p className="text-xs text-stone-400">
                    📍 {imovelSelecionado.bairro}, {imovelSelecionado.cidade}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-stone-500 block font-semibold uppercase">
                    {imovelSelecionado.modalidade}
                  </span>
                  <span className="text-2xl font-black text-amber-400">
                    R$ {imovelSelecionado.preco.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1c1817] p-4 rounded-2xl border border-stone-800 text-center">
                <div>
                  <span className="text-xs text-stone-500 block">Dormitórios</span>
                  <span className="text-base font-extrabold text-stone-200">{imovelSelecionado.quartos} quartos</span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Banheiros</span>
                  <span className="text-base font-extrabold text-stone-200">{imovelSelecionado.banheiros} banheiros</span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Vagas Garagem</span>
                  <span className="text-base font-extrabold text-stone-200">{imovelSelecionado.vagas} vagas</span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Área Útil</span>
                  <span className="text-base font-extrabold text-stone-200">{imovelSelecionado.areaUtil} m²</span>
                </div>
              </div>

              {/* FORMULÁRIO DE CONTATO / LEAD INTEGRADO */}
              <div className="bg-[#1c1817] p-5 rounded-2xl border border-stone-800 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b94a2b] to-[#80311a] text-amber-300 font-bold flex items-center justify-center text-sm border border-amber-500/40">
                    {imovelSelecionado.corretor.nome.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-200">
                      Corretor Responsável: {imovelSelecionado.corretor.nome}
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      CRECI: {imovelSelecionado.corretor.creci}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Seu Nome"
                    value={leadNome}
                    onChange={(e) => setLeadNome(e.target.value)}
                    className="bg-[#120f0e] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Seu WhatsApp / Telefone"
                    value={leadTelefone}
                    onChange={(e) => setLeadTelefone(e.target.value)}
                    className="bg-[#120f0e] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <textarea
                  placeholder="Escreva sua dúvida ou mensagem sobre este imóvel..."
                  value={leadMsg}
                  onChange={(e) => setLeadMsg(e.target.value)}
                  rows={2}
                  className="w-full bg-[#120f0e] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>

                <a
                  href={`https://wa.me/55${imovelSelecionado.corretor.telefone}?text=${encodeURIComponent(
                    `Olá ${imovelSelecionado.corretor.nome}!\n\nMeu nome é ${leadNome || "Interessado"} (${leadTelefone || "Sem tel"}).\nTenho interesse no imóvel *${imovelSelecionado.titulo}* (Ref: *${imovelSelecionado.codigo}*).\n\nMensagem: ${leadMsg || "Gostaria de mais informações."}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl shadow transition flex items-center justify-center space-x-2 uppercase tracking-wider"
                >
                  <span>💬 Enviar Mensagem via WhatsApp para o Corretor</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FAIXA GREGA INFERIOR */}
      <div className="w-full h-3 bg-gradient-to-r from-[#b94a2b] via-[#d47244] to-[#b94a2b] border-t border-amber-500/40 mt-16"></div>
    </div>
  );
}