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
    const { content, role, conversationId } = await req.json();

    const savedMessage = await prisma.message.create({
      data: {
        content,
        role,
        conversationId,
      },
    });

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('Erro ao salvar a mensagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
