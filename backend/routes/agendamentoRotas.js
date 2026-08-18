
const express = require("express");
const router = express.Router();
const model = require("../models/agendamentoModel");

router.get("/", async (req, res) => {
  try {
    if (!req.query.usuario_id) return res.status(400).json({ mensagem: "Informe o usuário." });
    res.json({ dados: await model.listarPorUsuario(req.query.usuario_id) });
  } catch (e) {
    res.status(500).json({ mensagem: "Erro ao listar agendamentos.", erro: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.body.usuario_id || !req.body.pet_id || !req.body.titulo || !req.body.data_hora) {
      return res.status(400).json({ mensagem: "Preencha usuário, pet, título e data." });
    }

    const dados = await model.cadastrar(req.body, req.body.usuario_id);
    res.status(201).json({ dados });
  } catch (e) {
    res.status(e.statusCode || 500).json({
      mensagem: e.statusCode ? e.message : "Erro ao criar agendamento.",
      erro: e.statusCode ? undefined : e.message
    });
  }
});

module.exports = router;
