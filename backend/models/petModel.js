
const conexaoMysql = require("../configs/mysql");

async function cadastrar(dados) {
  const {
    usuario_id,
    nome,
    especie,
    raca = null,
    sexo = null,
    data_nascimento = null,
    peso = null,
    cor = null,
    castrado = false,
    microchip = null,
    observacoes = null
  } = dados;

  const [r] = await conexaoMysql.execute(
    `INSERT INTO pets
    (usuario_id, nome, especie, raca, sexo, data_nascimento, peso, cor, castrado, microchip, observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      usuario_id, nome, especie, raca, sexo,
      data_nascimento, peso, cor, castrado ? 1 : 0,
      microchip, observacoes
    ]
  );

  return buscarPorId(r.insertId);
}

async function listarPorUsuario(usuarioId) {
  const [rows] = await conexaoMysql.execute(
    "SELECT * FROM pets WHERE usuario_id = ? ORDER BY id DESC",
    [usuarioId]
  );

  return rows;
}

async function buscarPorId(id) {
  const [rows] = await conexaoMysql.execute(
    "SELECT * FROM pets WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0] || null;
}

async function atualizarDados(id, usuarioId, dados) {
  const [resultado] = await conexaoMysql.execute(
    `UPDATE pets
     SET peso = ?, foto = ?
     WHERE id = ? AND usuario_id = ?`,
    [dados.peso, dados.foto, id, usuarioId]
  );

  if (resultado.affectedRows === 0) {
    const pet = await buscarPorId(id);

    if (!pet || String(pet.usuario_id) !== String(usuarioId)) {
      return null;
    }
  }

  return buscarPorId(id);
}

module.exports = {
  cadastrar,
  listarPorUsuario,
  buscarPorId,
  atualizarDados
};

