import { Request, Response } from "express";
import { PlantaRepository } from "../repositories/PlantaRepository";
import { Luminosidade } from "@prisma/client";

const repository = new PlantaRepository();

export class PlantaController {
  async createPlanta(req: Request, res: Response) {
    try {
      const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

      if (
        nome === undefined || typeof nome !== "string" || nome.trim() === "" ||
        especie === undefined || typeof especie !== "string" || especie.trim() === "" ||
        preco === undefined || !Number.isInteger(preco) || preco <= 0 ||
        estoque === undefined || !Number.isInteger(estoque) || estoque < 0 ||
        luminosidade === undefined || !Object.values(Luminosidade).includes(luminosidade) ||
        petFriendly === undefined || typeof petFriendly !== "boolean" ||
        regaACadaDias === undefined || !Number.isInteger(regaACadaDias) || regaACadaDias < 1
      ) {
        return res.status(400).json({ message: "Dados inv lidos ou incompletos no cadastro." });
      }

      const planta = await repository.createPlanta({
        nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias
      });

      return res.status(201).json(planta);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async findAllPlantas(req: Request, res: Response) {
    try {
      const { luminosidade, petFriendly, nome, ordem } = req.query;

      let luminosidadeFiltro: Luminosidade | undefined = undefined;
      if (luminosidade !== undefined) {
        if (!Object.values(Luminosidade).includes(luminosidade as Luminosidade)) {
          return res.status(400).json({ message: "Filtro de luminosidade inv lido." });
        }
        luminosidadeFiltro = luminosidade as Luminosidade;
      }

      let petFriendlyFiltro: boolean | undefined = undefined;
      if (petFriendly !== undefined) {
        if (petFriendly !== "true" && petFriendly !== "false") {
          return res.status(400).json({ message: "Filtro petFriendly inv lido." });
        }
        petFriendlyFiltro = petFriendly === "true";
      }

      const ordemString = ordem as string | undefined;
      if (ordemString !== undefined && ordemString !== 'preco' && ordemString !== 'nome') {
          return res.status(400).json({ message: "Filtro de ordem inv lido. Use 'preco' ou 'nome'." });
      }

      const plantas = await repository.findAllPlantas({
        luminosidade: luminosidadeFiltro,
        petFriendly: petFriendlyFiltro,
        nome: nome as string | undefined,
        ordem: ordemString
      });

      return res.status(200).json(plantas);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async findPlantasEsgotadas(req: Request, res: Response) {
      try {
          const plantasEsgotadas = await repository.findPlantasEsgotadas();
          return res.status(200).json(plantasEsgotadas);
      } catch (error) {
          return res.status(500).json({ message: "Erro interno no servidor." });
      }
  }

  async findPlantaById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID inv lido." });
      }

      const planta = await repository.findPlantaById(id);
      if (!planta) {
        return res.status(404).json({ message: "Planta n o encontrada." });
      }

      return res.status(200).json(planta);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async updatePlanta(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID inv lido." });
      }

      const plantaExistente = await repository.findPlantaById(id);
      if (!plantaExistente) {
        return res.status(404).json({ message: "Planta n o encontrada." });
      }

      const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

      if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) return res.status(400).json({ message: "Nome inv lido." });
      if (especie !== undefined && (typeof especie !== "string" || especie.trim() === "")) return res.status(400).json({ message: "Esp cie inv lida." });
      if (preco !== undefined && (!Number.isInteger(preco) || preco <= 0)) return res.status(400).json({ message: "Pre o inv lido." });
      if (estoque !== undefined && (!Number.isInteger(estoque) || estoque < 0)) return res.status(400).json({ message: "Estoque inv lido." });
      if (luminosidade !== undefined && !Object.values(Luminosidade).includes(luminosidade)) return res.status(400).json({ message: "Luminosidade inv lida." });
      if (petFriendly !== undefined && typeof petFriendly !== "boolean") return res.status(400).json({ message: "PetFriendly inv lido." });
      if (regaACadaDias !== undefined && (!Number.isInteger(regaACadaDias) || regaACadaDias < 1)) return res.status(400).json({ message: "RegaACadaDias inv lido." });

      const plantaAtualizada = await repository.updatePlanta(id, {
        nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias
      });

      return res.status(200).json(plantaAtualizada);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async deletePlanta(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID inv lido." });
      }

      const plantaExistente = await repository.findPlantaById(id);
      if (!plantaExistente) {
        return res.status(404).json({ message: "Planta n o encontrada." });
      }

      await repository.deletePlanta(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }

  async sellPlanta(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { quantidade } = req.body;

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID inv lido." });
      }

      if (quantidade === undefined || !Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({ message: "Quantidade inv lida para venda." });
      }

      const planta = await repository.findPlantaById(id);
      if (!planta) {
        return res.status(404).json({ message: "Planta n o encontrada." });
      }

      if (planta.estoque < quantidade) {
        return res.status(400).json({ message: `Estoque insuficiente. Temos apenas ${planta.estoque} vasos.` });
      }

      const plantaAtualizada = await repository.sellPlanta(id, quantidade);
      return res.status(200).json(plantaAtualizada);
    } catch (error) {
      // P2025   o c digo do Prisma para quando um update falha por n o encontrar o registro
      // Pode acontecer em condi es de corrida (duas pessoas compram junto)
      return res.status(500).json({ message: "Erro interno no servidor ao realizar a venda." });
    }
  }

  async getValorTotalEstoque(req: Request, res: Response) {
    try {
      const plantas = await repository.getEstoqueTotal();
      
      let valorTotalEmCentavos = 0;
      let totalDeVasos = 0;

      for (const planta of plantas) {
        valorTotalEmCentavos += planta.preco * planta.estoque;
        totalDeVasos += planta.estoque;
      }

      return res.status(200).json({ valorTotalEmCentavos, totalDeVasos });
    } catch (error) {
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }
}
