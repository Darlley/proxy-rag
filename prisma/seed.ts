import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Você pode adicionar lógica de seed aqui, se necessário
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
