import { PrismaClient, Prisma, Luminosidade } from "@prisma/client";

const prisma = new PrismaClient();

export class PlantaRepository {
  async createPlanta(data: Prisma.PlantaCreateInput) {
    return prisma.planta.create({ data });
  }

  async findAllPlantas(filtros: { luminosidade?: Luminosidade; petFriendly?: boolean; nome?: string; ordem?: string }) {
    const where: Prisma.PlantaWhereInput = {
      luminosidade: filtros.luminosidade,
      petFriendly: filtros.petFriendly,
      nome: filtros.nome ? { contains: filtros.nome, mode: 'insensitive' } : undefined,
    };

    let orderBy: Prisma.PlantaOrderByWithRelationInput | undefined = undefined;
    if (filtros.ordem === 'preco') orderBy = { preco: 'asc' };
    else if (filtros.ordem === 'nome') orderBy = { nome: 'asc' };

    return prisma.planta.findMany({
      where,
      orderBy,
    });
  }

  async findPlantasEsgotadas() {
    return prisma.planta.findMany({
      where: { estoque: 0 },
    });
  }

  async findPlantaById(id: number) {
    return prisma.planta.findUnique({ where: { id } });
  }

  async updatePlanta(id: number, data: Prisma.PlantaUpdateInput) {
    return prisma.planta.update({ where: { id }, data });
  }

  async deletePlanta(id: number) {
    return prisma.planta.delete({ where: { id } });
  }

  async sellPlanta(id: number, quantidade: number) {
    return prisma.planta.update({
      where: { id },
      data: { estoque: { decrement: quantidade } },
    });
  }

  async getEstoqueTotal() {
    return prisma.planta.findMany({ select: { preco: true, estoque: true } });
  }
}
