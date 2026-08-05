import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL inválida ou ausente." }, { status: 400 });
    }

    // Fazer a requisição obtendo o buffer original
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Falha ao acessar o site original (${response.status})` },
        { status: 400 }
      );
    }

    // Converter buffer para texto garantindo a codificação UTF-8 correta
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "";
    
    let decoder = new TextDecoder("utf-8");
    if (contentType.toLowerCase().includes("iso-8859-1") || contentType.toLowerCase().includes("latin1")) {
      decoder = new TextDecoder("iso-8859-1");
    }

    let html = decoder.decode(arrayBuffer);

    // Fallback: Se ainda contiver o caractere de substituição , força ISO-8859-1
    if (html.includes("")) {
      decoder = new TextDecoder("iso-8859-1");
      html = decoder.decode(arrayBuffer);
    }

    const $ = cheerio.load(html);

    // Extrair Título, Descrição e Imagem
    const ogTitle = $('meta[property="og:title"]').attr("content") || $("title").text() || "";
    const ogDescription = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "";
    const ogImage = $('meta[property="og:image"]').attr("content") || "";

    const images = [];
    if (ogImage) images.push(ogImage);

    $('img').each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && (src.includes("imovel") || src.includes("property") || src.includes("fotos") || src.includes("cdn")) && !images.includes(src)) {
        if (src.startsWith("http")) {
          images.push(src);
        }
      }
    });

    const fullText = $("body").text();
    const priceMatch = fullText.match(/R\$\s?([\d\.]+)/i);
    let preco = "";
    if (priceMatch) {
      preco = priceMatch[1].replace(/\./g, "");
    }

    return NextResponse.json({
      titulo: ogTitle.trim(),
      descricao: ogDescription.trim(),
      preco: preco,
      imagens: images.slice(0, 5),
      urlOriginal: url
    });

  } catch (error) {
    console.error("Erro no scraping:", error);
    return NextResponse.json(
      { error: "Erro ao extrair informações da URL." },
      { status: 500 }
    );
  }
}