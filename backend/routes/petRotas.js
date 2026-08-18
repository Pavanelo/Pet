const express = require("express");
const router = express.Router();
const c = require("../models/petController");
router.get("/", c.listarPorUsuario);
router.get("/:id", c.buscarPorId);
router.post("/", c.cadastrar);
module.exports = router;
