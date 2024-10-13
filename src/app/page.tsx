import PageHome from "@/components/PageHome";
import prisma from "@/utils/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

async function getSubscriptionId(userId: string | undefined): Promise<string | null> {
  if (!userId) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  });
  
  return user?.stripeSubscriptionId ?? null;
}

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const subscriptionId = await getSubscriptionId(user?.id);

  return <PageHome subscription={subscriptionId} />;
}
