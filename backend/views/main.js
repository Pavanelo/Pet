function sucesso(res, dados, mensagem, status){
const codigo = status || 200;

res.status(codigo).json({
    mensagem: mensagem,
    dados: dados
});


}

function erroServidor(res, mensagem, status, erro){
const codigo = status || 500;

res.status(codigo).json({
    mensagem: mensagem,
    erro: erro
});

function erroUsuario(res, mensagem, status){
    const codigo = status || 400;

    res.status(codigo).json({
        mensagem: mensagem
    });
}


module.exports = {
sucesso: sucesso,
erroServidor: erroServidor,
erroUsuario: erroUsuario
}

};