
const form = document.getElementById("formLogin");
const mensagem = document.getElementById("mensagemLogin");
const emailInput = document.getElementById("emailLogin");

form?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const botao = form.querySelector("button[type='submit']");
  mensagem.textContent = "";
  mensagem.className = "mensagem";
  botao.disabled = true;
  botao.textContent = "Entrando...";

  try {
    const resposta = await fetch("/api/usuarios/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email: emailInput.value.trim(),
        senha: document.getElementById("senhaLogin").value
      })
    });

    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem || "E-mail ou senha inválidos.");

    // Permanent browser session for this local project.
    localStorage.setItem("petpet_usuario", JSON.stringify(resultado.dados));
    localStorage.removeItem("petpet_pet");
    localStorage.removeItem("petpet_pet_id");

    const petsResp = await fetch(`/api/pets?usuario_id=${resultado.dados.id}`);
    const petsData = await petsResp.json();

    if (petsResp.ok && petsData.dados?.length) {
      const pet = petsData.dados[0];
      localStorage.setItem("petpet_pet", JSON.stringify(pet));
      localStorage.setItem("petpet_pet_id", String(pet.id));
      window.location.href = "conta.html";
    } else {
      window.location.href = "cadastro-pet.html";
    }
  } catch (erro) {
    mensagem.textContent = erro.message;
    mensagem.className = "mensagem erro";
    botao.disabled = false;
    botao.textContent = "Entrar";
  }
});
