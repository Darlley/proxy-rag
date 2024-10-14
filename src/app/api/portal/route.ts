import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const KINDE_SITE_URL = process.env.KINDE_SITE_URL!;

export async function POST(request: NextRequest) {
  const { getUser } = getKindeServerSession(); // Substitua pela forma correta de obter o usuário
  const user = await getUser();

  if (!user) {
    return NextResponse.redirect(KINDE_SITE_URL + '/api/auth/login');
  }

  const userId = request.headers.get('x-user-id'); // Obtém o userId do corpo da requisição

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is Required.' },
      { status: 401 }
    );
  }

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    return NextResponse.json({ error: 'User not found.' }, { status: 400 });
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
