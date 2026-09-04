export default function BannerPosicionamento() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-neutral-900 to-black border border-amber-600/30 p-6 sm:p-8 shadow-2xl">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>🛡️ Guardião de Oportunidades</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 font-serif">
            Maringá & Litoral do Paraná Conectados
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Seja para moradia fixa, investimentos de alto padrão ou a casa de praia perfeita para as suas férias: conectamos você aos melhores imóveis e corretores credenciados da região.
          </p>
        </div>

        <div className="shrink-0">
          <a
            href="https://wa.me/5544997278694?text=Olá!%20Gostaria%20de%20consultar%20imóveis%20disponíveis%20pela%20Esfinge."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-600/20"
          >
            <span>💬 Consultar no WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}