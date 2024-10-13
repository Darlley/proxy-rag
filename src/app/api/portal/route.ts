import prisma from "@/utils/prisma";
import { requireUser } from "@/utils/requireUser";
import { stripe } from "@/utils/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await requireUser(); // Requer o usuário autenticado

  const userId = request.headers.get('x-user-id'); // Obtém o userId do corpo da requisição

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is Required.' },
      { status: 401 }
    );
  }

  
  const userExists = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!userExists) {
    return NextResponse.json(
      { error: 'User not found.' },
      { status: 400 }
    );
  }
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: userExists?.stripeCustomerId as string,
      return_url: 'http://localhost:3000/',
    });

    // Retorna a URL da sessão criada
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão do portal de cobrança:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão do portal de cobrança' },
      { status: 500 }
    );
  }
}