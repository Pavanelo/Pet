
const express = require("express");
const router = express.Router();
const model = require("../models/historicoModel");

router.get("/", async (req, res) => {
  try {
    if (!req.query.pet_id || !req.query.usuario_id) {
      return res.status(400).json({ mensagem: "Informe pet e usuário." });
    }
    res.json({ dados: await model.listarPorPet(req.query.pet_id, req.query.usuario_id) });
  } catch (e) {
    res.status(500).json({ mensagem: "Erro ao listar histórico.", erro: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.body.usuario_id || !req.body.pet_id || !req.body.tipo || !req.body.titulo || !req.body.data_evento) {
      return res.status(400).json({ mensagem: "Preencha usuário, pet e os campos obrigatórios." });
    }
    res.status(201).json({
      dados: await model.cadastrar(req.body, req.body.usuario_id)
    });
  } catch (e) {
    res.status(e.statusCode || 500).json({
      mensagem: e.statusCode ? e.message : "Erro ao salvar registro.",
      erro: e.statusCode ? undefined : e.message
    });
  }
});

module.exports = router;
