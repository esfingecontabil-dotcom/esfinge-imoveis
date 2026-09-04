import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // A Vercel injeta automaticamente a cidade e o estado nos cabeçalhos da requisição
  const vercelCity = request.headers.get("x-vercel-ip-city");
  const vercelRegion = request.headers.get("x-vercel-ip-country-region"); // Ex: PR, SP, SC
  const vercelCountry = request.headers.get("x-vercel-ip-country") || "BR";

  let cidade = vercelCity ? decodeURIComponent(vercelCity) : "";
  let estado = vercelRegion || "";

  // Se estiver rodando localmente (localhost), define um padrão para testes
  if (!cidade && process.env.NODE_ENV === "development") {
    cidade = "Matinhos";
    estado = "PR";
  }

  return NextResponse.json({
    cidade,
    estado,
    pais: vercelCountry,
  });
}