import { Router } from "express";
import { UserController } from "./controllers/UserController";
import { PlantaController } from "./controllers/PlantaController";

const router = Router();
const userController = new UserController();
const plantaController = new PlantaController();

// Usu rios
router.post("/users", userController.create);
router.get("/users", userController.getAll);
router.get("/users/:id", userController.getById);
router.patch("/users/:id", userController.update);
router.delete("/users/:id", userController.delete);

// Plantas - Rotas Fixas primeiro (B nus inclusos)
router.post("/plantas", plantaController.createPlanta);
router.get("/plantas", plantaController.findAllPlantas);
router.get("/plantas/esgotadas", plantaController.findPlantasEsgotadas);
router.get("/plantas/estoque/valor-total", plantaController.getValorTotalEstoque);

// Plantas - Rotas Din micas (com :id)
router.get("/plantas/:id", plantaController.findPlantaById);
router.patch("/plantas/:id", plantaController.updatePlanta);
router.delete("/plantas/:id", plantaController.deletePlanta);
router.post("/plantas/:id/venda", plantaController.sellPlanta);

export { router };
