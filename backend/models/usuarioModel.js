const crypto = require("crypto");
const conexaoMysql = require("../configs/mysql");

function hashSenha(senha, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = crypto.scryptSync(senha, salt, 64).toString("hex");
    return { salt, hash };
}

function validarSenha(senha, salt, hashEsperado) {
    const hashAtual = crypto.scryptSync(senha, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hashAtual, "hex"), Buffer.from(hashEsperado, "hex"));
}

async function cadastrar(dadosUsuario) {
    const { nome, email, contato, senha, cargo = "Tutor" } = dadosUsuario;
    const [existente] = await conexaoMysql.execute("SELECT id FROM usuarios WHERE email = ? LIMIT 1", [email]);

    if (existente.length) {
        const erro = new Error("Este e-mail já está cadastrado.");
        erro.code = "EMAIL_DUPLICADO";
        throw erro;
    }

    const { salt, hash } = hashSenha(senha);
    const [resultado] = await conexaoMysql.execute(
        "INSERT INTO usuarios (nome, email, contato, cargo, senha_hash, senha_salt) VALUES (?, ?, ?, ?, ?, ?)",
        [nome, email, contato, cargo, hash, salt]
    );

    return { id: resultado.insertId, nome, email, contato, cargo };
}

async function listar() {
    const [usuarios] = await conexaoMysql.execute(
        "SELECT id, nome, email, contato, cargo, criado_em FROM usuarios ORDER BY id DESC"
    );
    return usuarios;
}

async function buscarPorId(id) {
    const [usuarios] = await conexaoMysql.execute(
        "SELECT id, nome, email, contato, cargo, criado_em FROM usuarios WHERE id = ? LIMIT 1", [id]
    );
    return usuarios[0] || null;
}

async function atualizar(id, dadosUsuario) {
    const campos = [];
    const valores = [];
    ["nome", "email", "contato", "cargo"].forEach((campo) => {
        if (dadosUsuario[campo] !== undefined) {
            campos.push(`${campo} = ?`);
            valores.push(dadosUsuario[campo]);
        }
    });

    if (!campos.length) return buscarPorId(id);
    valores.push(id);
    await conexaoMysql.execute(`UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`, valores);
    return buscarPorId(id);
}

async function excluir(id) {
    const [resultado] = await conexaoMysql.execute("DELETE FROM usuarios WHERE id = ?", [id]);
    return resultado.affectedRows > 0;
}

async function login(email, senha) {
    const [usuarios] = await conexaoMysql.execute(
        "SELECT id, nome, email, contato, cargo, senha_hash, senha_salt FROM usuarios WHERE email = ? LIMIT 1", [email]
    );

    const usuario = usuarios[0];
    if (!usuario || !validarSenha(senha, usuario.senha_salt, usuario.senha_hash)) return null;

    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        contato: usuario.contato,
        cargo: usuario.cargo
    };
}

module.exports = { cadastrar, listar, buscarPorId, atualizar, excluir, login };
