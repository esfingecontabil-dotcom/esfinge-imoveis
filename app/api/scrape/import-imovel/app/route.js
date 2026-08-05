import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Corpo da requisição inválido (JSON esperado)." },
        { status: 400 }
      );
    }

    const { url } = body || {};

    if (!url || typeof url !== "string" || !url.trim().startsWith("http")) {
      return NextResponse.json(
        { error: "Informe uma URL válida iniciando com http:// ou https://" },
        { status: 400 }
      );
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url.trim());
    } catch {
      return NextResponse.json(
        { error: "A URL informada possui formato inválido." },
        { status: 400 }
      );
    }

    // Timeout de 10 segundos para não travar a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Não foi possível acessar a página (Status HTTP ${res.status}).` },
        { status: 400 }
      );
    }

    const html = await res.text();

    const escapeRegExp = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const getMeta = (prop: string) => {
      const cleanProp = escapeRegExp(prop);
      const regex = new RegExp(
        `<meta[^>]*(?:property|name)=["']${cleanProp}["'][^>]*content=["']([^"']*)["']`,
        "i"
      );
      const match = html.match(regex);
      if (match && match[1]) return match[1];

      const regexInverted = new RegExp(
        `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${cleanProp}["']`,
        "i"
      );
      const matchInverted = html.match(regexInverted);
      return matchInverted && matchInverted[1] ? matchInverted[1] : "";
    };

    const titulo =
      getMeta("og:title") ||
      getMeta("twitter:title") ||
      getMeta("title") ||
      "";

    const descricao =
      getMeta("og:description") ||
      getMeta("twitter:description") ||
      getMeta("description") ||
      "";

    const imagem =
      getMeta("og:image") || getMeta("twitter:image") || "";

    let preco =
      getMeta("product:price:amount") || getMeta("og:price:amount") || "";

    if (!preco) {
      const precoMatch = html.match(/R\$\s?([\d.,]+)/i);
      if (precoMatch && precoMatch[1]) {
        const rawPreco = precoMatch[1];
        if (rawPreco.includes(",")) {
          preco = rawPreco.replace(/\./g, "").replace(",", ".");
        } else {
          preco = rawPreco.replace(/,/g, "");
        }
      }
    }

    const parsedPreco = preco ? parseFloat(preco) : NaN;

    return NextResponse.json({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      preco: !isNaN(parsedPreco) ? parsedPreco : "",
      imagem: imagem || "",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado na leitura";
    return NextResponse.json(
      { error: "Erro ao extrair dados: " + message },
      { status: 500 }
    );
  }
}