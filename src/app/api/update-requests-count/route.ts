import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { userId, incrementAskRequests } = await req.json();

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Usuário inválido' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        askRequests: { increment: incrementAskRequests },
      },
    });

    return NextResponse.json({ success: true, askRequests: updatedUser.askRequests });
  } catch (error) {
    console.error('Erro ao atualizar contagem de solicitações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
