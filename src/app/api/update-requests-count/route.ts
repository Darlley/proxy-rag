import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { increment } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        requests: {
          increment: increment,
        },
      },
    });

    return NextResponse.json({ success: true, requests: updatedUser.requests });
  } catch (error) {
    console.error('Erro ao atualizar contagem de solicitações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}