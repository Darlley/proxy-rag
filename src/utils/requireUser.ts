import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/types';
import { NextResponse } from 'next/server';

const KINDE_SITE_URL = process.env.KINDE_SITE_URL!;

export const requireUser = async (): Promise<KindeUser | null> => {
  // Adicionada a tipagem de retorno
  const { getUser } = getKindeServerSession(); // Substitua pela forma correta de obter o usuário
  const user = await getUser();

  if (!user) {
    NextResponse.redirect(KINDE_SITE_URL + '/api/auth/login');
    // Adicionada a declaração de retorno para o caso de usuário não encontrado
  }

  return user;
};