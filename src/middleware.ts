import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function middleware(request: NextRequest) {
  // Obtém a sessão do Kinde
  const { isAuthenticated } = getKindeServerSession();

  // Verifica se a rota é a raiz '/'
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // Para todas as outras rotas, verifica a autenticação
  if (!(await isAuthenticated())) {
    // Redireciona para a página de login se não estiver autenticado
    return NextResponse.redirect(new URL('/api/auth/login', request.url));
  }

  // Se estiver autenticado, permite o acesso à rota
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
