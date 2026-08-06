import React from 'react';

export default function BannerPosicionamento() {
  return (
    <section className="w-full max-w-7xl mx-auto my-8 px-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/40 border border-amber-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-sm">
        
        {/* Efeito Glow / Brilho de Fundo */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Ícone e Texto */}
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-2xl flex-shrink-0">
              🛡️
            </div>
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                Compromisso Esfinge Imóveis
              </span>
              <p className="text-base md:text-lg text-neutral-200 font-medium leading-relaxed">
                <span className="text-white font-semibold">Nós não somos uma imobiliária disputando o seu cliente.</span>{" "}
                O Portal Esfinge é a vitrine tecnológica do Paraná criada para conectar o comprador diretamente ao seu WhatsApp.
              </p>
            </div>
          </div>

          {/* Badge de Destaque */}
          <div className="flex-shrink-0 w-full md:w-auto text-center md:text-right border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-6">
            <span className="text-xs text-neutral-400 block">Corretagem e Leads:</span>
            <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">
              ⚡ 100% Direto com Você
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}