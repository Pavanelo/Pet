const form = document.getElementById("formCadastrarUsuario");
const mensagem = document.getElementById("mensagemCadastro");
const botao = document.getElementById("botao_cadastro");
function mostrarMensagem(texto, tipo = "erro") { if (!mensagem) return; mensagem.textContent = texto; mensagem.className = `mensagem ${tipo}`; }
form?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(form).entries());
  if (dados.senha !== dados.confirmarSenha) return mostrarMensagem("As senhas não coincidem.");
  if (!document.getElementById("termos")?.checked) return mostrarMensagem("Aceite os termos para continuar.");
  botao.disabled = true; botao.textContent = "Criando conta...";
  try {
    const resposta = await fetch("/api/usuarios", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({nome:dados.nome,email:dados.email,contato:dados.contato,senha:dados.senha,cargo:"Tutor"}) });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem || "Não foi possível criar a conta.");
    localStorage.setItem("petpet_usuario", JSON.stringify(resultado.dados));
    sessionStorage.setItem("petpet_usuario", JSON.stringify(resultado.dados));
    window.location.href = "cadastro-pet.html";
  } catch (erro) { mostrarMensagem(erro.message); botao.disabled=false; botao.textContent="Continuar para o cadastro do pet"; }
});
