
const petModel = require("./petModel");
const view = require("../views/usuarioView");

function validar(d) {
  if (!d.usuario_id || !d.nome || !d.especie) {
    return "Informe o tutor, o nome e a espécie do pet.";
  }

  return null;
}

async function cadastrar(req, res) {
  try {
    const erro = validar(req.body);

    if (erro) {
      return view.erroUsuario(res, erro, 400);
    }

    const pet = await petModel.cadastrar(req.body);

    return view.sucesso(res, pet, "Pet cadastrado com sucesso", 201);
  } catch (e) {
    console.error("ERRO AO CADASTRAR PET:", e);
    return view.erroServidor(
      res, "Erro ao cadastrar pet", 500, e.message
    );
  }
}

async function listarPorUsuario(req, res) {
  try {
    if (!req.query.usuario_id) {
      return view.erroUsuario(res, "Informe o usuário.", 400);
    }

    const pets = await petModel.listarPorUsuario(req.query.usuario_id);

    return view.sucesso(res, pets, "Pets encontrados");
  } catch (e) {
    return view.erroServidor(
      res, "Erro ao listar pets", 500, e.message
    );
  }
}

async function buscarPorId(req, res) {
  try {
    const pet = await petModel.buscarPorId(req.params.id);

    if (!pet) {
      return view.erroUsuario(res, "Pet não encontrado.", 404);
    }

    return view.sucesso(res, pet, "Pet encontrado");
  } catch (e) {
    return view.erroServidor(
      res, "Erro ao buscar pet", 500, e.message
    );
  }
}

async function atualizarDados(req, res) {
  try {
    const { usuario_id, peso, foto } = req.body;

    if (!usuario_id) {
      return view.erroUsuario(res, "Informe o usuário.", 400);
    }

    if (
      peso !== null &&
      peso !== undefined &&
      (typeof peso !== "number" || !Number.isFinite(peso) || peso < 0)
    ) {
      return view.erroUsuario(res, "Informe um peso válido.", 400);
    }

    if (foto !== null && foto !== undefined && typeof foto !== "string") {
      return view.erroUsuario(res, "Foto inválida.", 400);
    }

    const pet = await petModel.atualizarDados(
      req.params.id,
      usuario_id,
      { peso: peso ?? null, foto: foto ?? null }
    );

    if (!pet) {
      return view.erroUsuario(res, "Pet não encontrado.", 404);
    }

    return view.sucesso(res, pet, "Pet atualizado com sucesso");
  } catch (e) {
    console.error("ERRO AO ATUALIZAR PET:", e);
    return view.erroServidor(
      res, "Erro ao atualizar pet", 500, e.message
    );
  }
}

module.exports = {
  cadastrar,
  listarPorUsuario,
  buscarPorId,
  atualizarDados
};
