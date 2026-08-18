const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const usuarioRotas = require("../routes/usuarioRotas");
const petRotas = require("../routes/petRotas");
const agendamentoRotas = require("../routes/agendamentoRotas");
const historicoRotas = require("../routes/historicoRotas");
const conexaoMysql = require("../configs/mysql");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, "../../frontend");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(frontendPath));
app.use("/img", express.static(path.join(frontendPath, "assets/img")));
app.use("/api/usuarios", usuarioRotas);
app.use("/api/pets", petRotas);
app.use("/api/agendamentos", agendamentoRotas);
app.use("/api/historico", historicoRotas);

app.get("/", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));
app.get("/health", (req, res) => res.json({ status: "ok", mensagem: "PetPet API online" }));

app.use((req, res) => res.status(404).json({ mensagem: "Rota não encontrada." }));

async function prepararTabelasSaude() {
    await conexaoMysql.execute(`CREATE TABLE IF NOT EXISTS agendamentos (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT, pet_id INT UNSIGNED NOT NULL, titulo VARCHAR(150) NOT NULL, tipo VARCHAR(50) NOT NULL DEFAULT 'Consulta',
      data_hora DATETIME NOT NULL, local VARCHAR(180) NULL, status VARCHAR(40) NOT NULL DEFAULT 'Confirmado', observacoes TEXT NULL, criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id), KEY idx_ag_pet(pet_id), CONSTRAINT fk_ag_pet FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE
    )`);
    await conexaoMysql.execute(`CREATE TABLE IF NOT EXISTS historico_saude (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT, pet_id INT UNSIGNED NOT NULL, tipo VARCHAR(50) NOT NULL, titulo VARCHAR(150) NOT NULL, data_evento DATE NOT NULL,
      profissional VARCHAR(150) NULL, local VARCHAR(180) NULL, observacoes TEXT NULL, criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(id), KEY idx_hist_pet(pet_id), CONSTRAINT fk_hist_pet FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE
    )`);
}

async function prepararBanco() {
    // Garante que a tabela pets tenha o mesmo padrão usado pela API.
    // Esta rotina também migra instalações antigas que usavam a coluna id_tutor.
    await conexaoMysql.execute(`CREATE TABLE IF NOT EXISTS pets (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        usuario_id INT UNSIGNED NOT NULL,
        nome VARCHAR(120) NOT NULL,
        especie VARCHAR(40) NOT NULL,
        raca VARCHAR(100) NULL,
        sexo VARCHAR(20) NULL,
        data_nascimento DATE NULL,
        peso DECIMAL(6,2) NULL,
        cor VARCHAR(80) NULL,
        castrado TINYINT(1) NOT NULL DEFAULT 0,
        microchip VARCHAR(80) NULL,
        observacoes TEXT NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_pets_usuario (usuario_id)
    )`);

    // Remove FKs antigas da tabela pets antes de renomear/migrar colunas.
    const [fksAntigas] = await conexaoMysql.execute(`
        SELECT DISTINCT CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'pets'
          AND REFERENCED_TABLE_NAME = 'usuarios'
    `);

    for (const fk of fksAntigas) {
        await conexaoMysql.execute(`ALTER TABLE pets DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        console.log(`Banco: relação antiga ${fk.CONSTRAINT_NAME} removida para migração.`);
    }

    let [colunas] = await conexaoMysql.execute(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pets'
    `);
    let nomes = new Set(colunas.map(c => c.COLUMN_NAME));

    // Versões antigas do projeto usavam id_tutor. O código atual usa usuario_id.
    if (nomes.has('id_tutor') && !nomes.has('usuario_id')) {
        await conexaoMysql.execute(`
            ALTER TABLE pets
            CHANGE COLUMN id_tutor usuario_id INT UNSIGNED NOT NULL
        `);
        console.log('Banco: pets.id_tutor migrado para pets.usuario_id.');
    } else if (nomes.has('id_tutor') && nomes.has('usuario_id')) {
        // Instalação intermediária: preserva os dados antigos e elimina a coluna duplicada.
        await conexaoMysql.execute(`
            UPDATE pets p
            SET p.usuario_id = p.id_tutor
            WHERE (p.usuario_id IS NULL OR p.usuario_id = 0)
              AND p.id_tutor IS NOT NULL
        `);
        await conexaoMysql.execute(`ALTER TABLE pets DROP COLUMN id_tutor`);
        console.log('Banco: coluna duplicada pets.id_tutor removida.');
    }

    [colunas] = await conexaoMysql.execute(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pets'
    `);
    nomes = new Set(colunas.map(c => c.COLUMN_NAME));

    const colunasNecessarias = {
        usuario_id: 'INT UNSIGNED NOT NULL',
        nome: 'VARCHAR(120) NOT NULL',
        especie: 'VARCHAR(40) NOT NULL',
        raca: 'VARCHAR(100) NULL',
        sexo: 'VARCHAR(20) NULL',
        data_nascimento: 'DATE NULL',
        peso: 'DECIMAL(6,2) NULL',
        cor: 'VARCHAR(80) NULL',
        castrado: 'TINYINT(1) NOT NULL DEFAULT 0',
        microchip: 'VARCHAR(80) NULL',
        observacoes: 'TEXT NULL',
        criado_em: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
        atualizado_em: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    };

    for (const [nome, definicao] of Object.entries(colunasNecessarias)) {
        if (!nomes.has(nome)) {
            await conexaoMysql.execute(`ALTER TABLE pets ADD COLUMN ${nome} ${definicao}`);
            console.log(`Banco: coluna pets.${nome} criada.`);
        }
    }

    const [indices] = await conexaoMysql.execute(
        `SHOW INDEX FROM pets WHERE Key_name = 'idx_pets_usuario'`
    );
    if (!indices.length) {
        await conexaoMysql.execute(`ALTER TABLE pets ADD INDEX idx_pets_usuario (usuario_id)`);
    }

    // Recria a FK com o nome e a coluna usados pelo código atual.
    const [fks] = await conexaoMysql.execute(`
        SELECT CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'pets'
          AND COLUMN_NAME = 'usuario_id'
          AND REFERENCED_TABLE_NAME = 'usuarios'
    `);

    if (!fks.length) {
        await conexaoMysql.execute(`
            ALTER TABLE pets
            ADD CONSTRAINT fk_pets_usuario
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        `);
        console.log('Banco: FK pets.usuario_id -> usuarios.id criada.');
    }
}
prepararBanco()
    .then(() => prepararTabelasSaude())
    .then(() => app.listen(PORT, () => console.log(`PetPet rodando em http://localhost:${PORT}`)))
    .catch((erro) => {
        console.error("Não foi possível preparar o banco:", erro.message);
        process.exit(1);
    });
