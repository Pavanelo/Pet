
const usuarioPerfil = JSON.parse(
  localStorage.getItem("petpet_usuario") || "null"
);

let petAtual = null;

const nomePet = document.getElementById("nomePet");
const detalhes = document.getElementById("detalhesPet");
const peso = document.getElementById("pesoPet");
const foto = document.getElementById("fotoPet");

const formEditar = document.getElementById("formEditarPet");
const campoPeso = document.getElementById("pesoEditar");
const campoFoto = document.getElementById("fotoEditar");
const mensagem = document.getElementById("msgEditarPet");

if (!usuarioPerfil) {
  window.location.href = "login.html";
}

async function carregarPerfil() {
  try {
    const resposta = await fetch(
      `/api/pets?usuario_id=${encodeURIComponent(usuarioPerfil.id)}`
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.mensagem || "Não foi possível carregar o perfil."
      );
    }

    const pet = resultado.dados?.[0];

    if (!pet) {
      window.location.href = "cadastro-pet.html";
      return;
    }

    petAtual = pet;

    localStorage.setItem("petpet_pet", JSON.stringify(pet));

    document.getElementById("tituloPerfil").textContent =
      `Perfil de ${pet.nome}`;

    document.getElementById("subtituloPerfil").textContent =
      `Olá, ${usuarioPerfil.nome.split(" ")[0]}! Aqui você acompanha os cuidados de ${pet.nome}.`;

    nomePet.textContent = pet.nome;

    detalhes.textContent = [
      pet.especie,
      pet.raca,
      pet.sexo
    ].filter(Boolean).join(" • ") || "Pet";

    peso.textContent =
      pet.peso !== null &&
      pet.peso !== undefined &&
      pet.peso !== ""
        ? `Peso: ${pet.peso} kg`
        : "Peso não informado";

    if (pet.foto) {
      foto.src = pet.foto;
    }

    if (campoPeso) {
      campoPeso.value = pet.peso ?? "";
    }

    await carregarHistoricoPerfil();

  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);

    document.getElementById("subtituloPerfil").textContent =
      "Não foi possível carregar o perfil agora.";
  }
}

function reduzirFoto(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo.type.startsWith("image/")) {
      reject(new Error("Selecione um arquivo de imagem válido."));
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const tamanhoMaximo = 800;
        let largura = imagem.width;
        let altura = imagem.height;

        if (largura > tamanhoMaximo || altura > tamanhoMaximo) {
          const proporcao = Math.min(
            tamanhoMaximo / largura,
            tamanhoMaximo / altura
          );

          largura = Math.round(largura * proporcao);
          altura = Math.round(altura * proporcao);
        }

        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext("2d");

        if (!contexto) {
          reject(new Error("Não foi possível processar a imagem."));
          return;
        }

        contexto.drawImage(imagem, 0, 0, largura, altura);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };

      imagem.onerror = () => {
        reject(new Error("Não foi possível abrir essa imagem."));
      };

      imagem.src = leitor.result;
    };

    leitor.onerror = () => {
      reject(new Error("Não foi possível ler o arquivo selecionado."));
    };

    leitor.readAsDataURL(arquivo);
  });
}

if (formEditar) {
  formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!petAtual) {
      mensagem.textContent = "O perfil do pet ainda não foi carregado.";
      return;
    }

    const pesoValor = campoPeso.value.trim();
    const arquivo = campoFoto.files[0];

    if (pesoValor !== "" && Number(pesoValor) < 0) {
      mensagem.textContent = "O peso não pode ser negativo.";
      return;
    }

    mensagem.textContent = "Salvando alterações...";

    try {
      let fotoData = petAtual.foto || null;

      if (arquivo) {
        fotoData = await reduzirFoto(arquivo);
      }

      const resposta = await fetch(`/api/pets/${petAtual.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario_id: usuarioPerfil.id,
          peso: pesoValor === "" ? null : Number(pesoValor),
          foto: fotoData
        })
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.mensagem || "Não foi possível salvar as alterações."
        );
      }

      mensagem.textContent = "Alterações salvas com sucesso!";

      await carregarPerfil();

      campoFoto.value = "";

    } catch (erro) {
      console.error("Erro ao atualizar pet:", erro);
      mensagem.textContent = erro.message || "Ocorreu um erro ao salvar.";
    }
  });
}

async function carregarHistoricoPerfil() {
  const lista = document.getElementById("historicoPerfilLista");

  if (!lista || !petAtual) return;

  try {
    const petId = petAtual.id;

    const resposta = await fetch(
      `/api/historico?pet_id=${encodeURIComponent(petId)}&usuario_id=${encodeURIComponent(usuarioPerfil.id)}`
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.mensagem || "Não foi possível carregar o histórico.");
    }

    const itens = resultado.dados || [];

    if (itens.length === 0) {
      lista.innerHTML = `
        <div class="empty">
          <h3>Nenhum registro encontrado</h3>
          <p>Os registros de saúde do seu pet aparecerão aqui.</p>
        </div>
      `;
      return;
    }

    lista.innerHTML = itens.map(item => `
      <article class="timeline-item">
        <h3>${item.tipo || "Registro de saúde"}</h3>
        <p>${item.descricao || item.observacoes || "Sem descrição."}</p>
        <small>${item.data || item.data_registro || ""}</small>
      </article>
    `).join("");

  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
    lista.innerHTML = `
      <div class="empty">
        <p>Não foi possível carregar o histórico.</p>
      </div>
    `;
  }
}

if (usuarioPerfil) {
  carregarPerfil();
}
