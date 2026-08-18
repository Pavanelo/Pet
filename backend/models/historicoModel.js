
const db = require("../configs/mysql");

async function listarPorPet(petId, usuarioId) {
  const [r] = await db.execute(`
    SELECT h.*
    FROM historico_saude h
    JOIN pets p ON p.id = h.pet_id
    WHERE h.pet_id = ? AND p.usuario_id = ?
    ORDER BY h.data_evento DESC, h.id DESC
  `, [petId, usuarioId]);
  return r;
}

async function cadastrar(d, usuarioId) {
  const [pets] = await db.execute(
    `SELECT id FROM pets WHERE id = ? AND usuario_id = ?`,
    [d.pet_id, usuarioId]
  );
  if (!pets.length) {
    const erro = new Error("O pet selecionado não pertence a esta conta.");
    erro.statusCode = 403;
    throw erro;
  }

  const [r] = await db.execute(`
    INSERT INTO historico_saude
      (pet_id, tipo, titulo, data_evento, profissional, local, observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    d.pet_id,
    d.tipo,
    d.titulo,
    d.data_evento,
    d.profissional || null,
    d.local || null,
    d.observacoes || null
  ]);

  const [rows] = await db.execute(
    `SELECT * FROM historico_saude WHERE id = ?`,
    [r.insertId]
  );
  return rows[0];
}

module.exports = { listarPorPet, cadastrar };
