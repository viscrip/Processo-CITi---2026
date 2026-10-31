import { PrismaClient, Luminosidade } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.planta.createMany({
    data: [
      {
        nome: 'Costela-de-ad o',
        especie: 'Monstera deliciosa',
        preco: 8990,
        estoque: 12,
        luminosidade: Luminosidade.MEIA_SOMBRA,
        petFriendly: false,
        regaACadaDias: 3
      },
      {
        nome: 'Samambaia',
        especie: 'Nephrolepis exaltata',
        preco: 4500,
        estoque: 0,
        luminosidade: Luminosidade.SOMBRA,
        petFriendly: true,
        regaACadaDias: 2
      },
      {
        nome: 'Cacto',
        especie: 'Cactaceae',
        preco: 2500,
        estoque: 5,
        luminosidade: Luminosidade.SOL_PLENO,
        petFriendly: false,
        regaACadaDias: 15
      }
    ]
  })
  console.log("Banco populado com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
