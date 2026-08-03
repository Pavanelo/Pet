const usuarioModel = require("../models/usuarioModel");
const usuarioView = require("../views/usuarioView");

async function cadastar(req, res) {
    try{
        const dadosUsuario = req.body;
        const usuarioCadastrado = await usuarioModel.cadastrar(dadosUsuario);
        usuarioView.sucesso(res, usuarioCadastrado,"Usuário cadastrado com sucesso", 201);
    } catch (erro) {
        usuarioView.erroServidor(res, "Erro ao cadastrar usuário", 500, erro.message);
    }
};