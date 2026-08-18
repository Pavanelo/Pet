const usuarioModel = require("./usuarioModel");
const usuarioView = require("../views/usuarioView");

function validarCadastro(dados) {
    if (!dados.nome || !dados.email || !dados.contato || !dados.senha) return "Preencha todos os campos obrigatórios.";
    if (!/^\S+@\S+\.\S+$/.test(dados.email)) return "Digite um e-mail válido.";
    if (dados.senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    return null;
}

async function cadastrar(req, res) {
    try {
        const erroValidacao = validarCadastro(req.body);
        if (erroValidacao) return usuarioView.erroUsuario(res, erroValidacao, 400);
        const usuario = await usuarioModel.cadastrar(req.body);
        return usuarioView.sucesso(res, usuario, "Usuário cadastrado com sucesso", 201);
    } catch (erro) {
        if (erro.code === "EMAIL_DUPLICADO") return usuarioView.erroUsuario(res, erro.message, 409);
        return usuarioView.erroServidor(res, "Erro ao cadastrar usuário", 500, erro.message);
    }
}

async function listar(req, res) {
    try { return usuarioView.sucesso(res, await usuarioModel.listar(), "Usuários encontrados"); }
    catch (erro) { return usuarioView.erroServidor(res, "Erro ao listar usuários", 500, erro.message); }
}

async function buscarPorId(req, res) {
    try {
        const usuario = await usuarioModel.buscarPorId(req.params.id);
        if (!usuario) return usuarioView.erroUsuario(res, "Usuário não encontrado.", 404);
        return usuarioView.sucesso(res, usuario, "Usuário encontrado");
    } catch (erro) { return usuarioView.erroServidor(res, "Erro ao buscar usuário", 500, erro.message); }
}

async function atualizar(req, res) {
    try {
        const usuario = await usuarioModel.atualizar(req.params.id, req.body);
        if (!usuario) return usuarioView.erroUsuario(res, "Usuário não encontrado.", 404);
        return usuarioView.sucesso(res, usuario, "Usuário atualizado");
    } catch (erro) { return usuarioView.erroServidor(res, "Erro ao atualizar usuário", 500, erro.message); }
}

async function excluir(req, res) {
    try {
        const excluido = await usuarioModel.excluir(req.params.id);
        if (!excluido) return usuarioView.erroUsuario(res, "Usuário não encontrado.", 404);
        return usuarioView.sucesso(res, null, "Usuário excluído");
    } catch (erro) { return usuarioView.erroServidor(res, "Erro ao excluir usuário", 500, erro.message); }
}

async function login(req, res) {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) return usuarioView.erroUsuario(res, "Informe e-mail e senha.", 400);
        const usuario = await usuarioModel.login(email, senha);
        if (!usuario) return usuarioView.erroUsuario(res, "E-mail ou senha inválidos.", 401);
        return usuarioView.sucesso(res, usuario, "Login realizado com sucesso");
    } catch (erro) { return usuarioView.erroServidor(res, "Erro ao realizar login", 500, erro.message); }
}

module.exports = { cadastrar, listar, buscarPorId, atualizar, excluir, login };
