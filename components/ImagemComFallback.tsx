"use client";

import { useState } from "react";

interface ImagemComFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

const IMAGEM_PADRAO =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

export function ImagemComFallback({ src, alt, className = "" }: ImagemComFallbackProps) {
  const sanitizarUrl = (url: string) => {
    if (!url) return IMAGEM_PADRAO;
    if (url.startsWith("http://")) return url.replace("http://", "https://");
    return url;
  };

  const [imgSrc, setImgSrc] = useState<string>(sanitizarUrl(src));
  const [comErro, setComErro] = useState<boolean>(false);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      className={className}
      onError={() => {
        if (!comErro) {
          setComErro(true);
          setImgSrc(IMAGEM_PADRAO);
        }
      }}
    />
  );
}