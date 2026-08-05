import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    // Permite que a requisição siga normalmente para a página do admin
    return NextResponse.next();
  } catch (error) {
    console.error("Erro no Middleware:", error);
    return NextResponse.next();
  }
}

// Executa apenas nas rotas necessárias, ignorando arquivos estáticos
export const config = {
  matcher: ["/admin/:path*"],
};