
const db = require("../configs/mysql");

async function listarPorUsuario(usuarioId) {
  const [r] = await db.execute(`
    SELECT a.*, p.nome AS pet_nome
    FROM agendamentos a
    JOIN pets p ON p.id = a.pet_id
    WHERE p.usuario_id = ?
    ORDER BY a.data_hora ASC
  `, [usuarioId]);
  return r;
}

async function cadastrar(d, usuarioId) {
  const [pets] = await db.execute(
    `SELECT id, nome FROM pets WHERE id = ? AND usuario_id = ?`,
    [d.pet_id, usuarioId]
  );
  if (!pets.length) {
    const erro = new Error("O pet selecionado não pertence a esta conta.");
    erro.statusCode = 403;
    throw erro;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.execute(`
      INSERT INTO agendamentos
        (pet_id, titulo, tipo, data_hora, local, status, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      d.pet_id,
      d.titulo,
      d.tipo || "Consulta",
      d.data_hora,
      d.local || null,
      d.status || "Confirmado",
      d.observacoes || null
    ]);

    // Connect every appointment to the pet's health history.
    // A vaccine appointment becomes a Vacina history item; medication appointments
    // become Medicamento; other appointments keep their own type.
    const tipoHistorico =
      d.tipo === "Vacina" ? "Vacina" :
      d.tipo === "Medicamento" ? "Medicamento" :
      d.tipo || "Consulta";

    const dataEvento = String(d.data_hora).slice(0, 10);
    const observacoes = [
      "Agendamento criado pelo calendário.",
      d.observacoes || ""
    ].filter(Boolean).join(" ");

    await conn.execute(`
      INSERT INTO historico_saude
        (pet_id, tipo, titulo, data_evento, profissional, local, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      d.pet_id,
      tipoHistorico,
      `Agendado: ${d.titulo}`,
      dataEvento,
      null,
      d.local || null,
      observacoes
    ]);

    await conn.commit();

    const [rows] = await db.execute(`
      SELECT a.*, p.nome AS pet_nome
      FROM agendamentos a
      JOIN pets p ON p.id = a.pet_id
      WHERE a.id = ?
    `, [r.insertId]);

    return rows[0];
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = { listarPorUsuario, cadastrar };
