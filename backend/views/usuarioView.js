function sucesso(res, dados, mensagem, status = 200) {
    return res.status(status).json({ mensagem, dados });
}

function erroServidor(res, mensagem, status = 500, erro = undefined) {
    const resposta = { mensagem };
    if (process.env.NODE_ENV !== "production" && erro) resposta.erro = erro;
    return res.status(status).json(resposta);
}

function erroUsuario(res, mensagem, status = 400) {
    return res.status(status).json({ mensagem });
}

module.exports = { sucesso, erroServidor, erroUsuario };
