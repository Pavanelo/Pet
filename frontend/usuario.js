const formCadastrarUsuario = document.getElementById("formCadastrarUsuario");
const botaoListarUsuarios = document.getElementById("botaoListarUsuarios");
const botaoLimparUsuario = document.getElementById("botaoLimparUsuario");
const resultado = document.getElementById("resultado");
const tabelaUsuarios = document.getElementById("tabelaUsuarios");
const botaoSalvarUsuario = document.getElementById("botaoSalvarUsuario");

formCadastrarUsuario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const id = document.getElementById("idUsuario").value;
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const contato = document.getElementById("contato").value;
    const cargo = document.getElementById("cargo").value;

    const dadosUsuario = {
        nome: nome,
        email: email,
        contato: contato,
        cargo: cargo
    };
}
    
)

if (id !== ""){
    url = '/usuario/${id}';
    metodo = "PUT";
}

try{
    const resposta = await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosUsuario)
    });

    const dadosResposta = await resposta.json();
    resultado.textContent = JSON.stringify(dadosResposta, null, 2);
    limparFormularioUsuario();
    botaoListarUsuarios();
} catch (erro) {
    resultado.textContent = "Erro ao salvar cliente";
    console.log(erro.message);
}
