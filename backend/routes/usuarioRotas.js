const express = require("express");
const router = express.Router();
const usuarioController = require("../models/usuarioController");

router.get("/", usuarioController.listar);
router.get("/:id", usuarioController.buscarPorId);
router.post("/", usuarioController.cadastrar);
router.put("/:id", usuarioController.atualizar);
router.delete("/:id", usuarioController.excluir);

module.exports = router;
