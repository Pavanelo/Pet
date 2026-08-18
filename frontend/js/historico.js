
let petsH = []; const params = new URLSearchParams(window.location.search); const tipoInicial = params.get("tipo");

async function carregarHistorico() {
  try {
    const r = await fetch(`/api/pets?usuario_id=${encodeURIComponent(petpetUsuario.id)}`);
    const j = await r.json();
    petsH = j.dados || [];

    const sel = document.getElementById("petHistorico");
    const formSel = document.getElementById("petHistoricoForm");
    const opts = petsH.map(p => `<option value="${p.id}">${p.nome}</option>`).join("");

    sel.innerHTML = opts;
    formSel.innerHTML = opts;

    if (!petsH.length) {
      document.getElementById("listaHistorico").innerHTML =
        '<div class="empty">Cadastre um pet primeiro.</div>';
      return;
    }

    sel.onchange = () => mostrar(sel.value);
    mostrar(sel.value);
  } catch (e) {
    document.getElementById("listaHistorico").innerHTML =
      '<div class="empty">Não foi possível carregar o histórico.</div>';
  }
}

async function mostrar(petId) {
  const pet = petsH.find(p => String(p.id) === String(petId));
  if (pet) document.getElementById("petHistoricoNome").textContent = pet.nome;

  const filtro = document.getElementById("filtroHistorico")?.value || "";
  const url = `/api/historico?pet_id=${encodeURIComponent(petId)}&usuario_id=${encodeURIComponent(petpetUsuario.id)}`;
  const r = await fetch(url);
  const j = await r.json();
  let lista = j.dados || [];

  if (filtro) lista = lista.filter(x => x.tipo === filtro);

  document.getElementById("totalHistorico").textContent = lista.length;

  document.getElementById("listaHistorico").innerHTML = lista.length
    ? lista.map(x => `<article class="history-item">
        <span class="history-dot"></span>
        <span class="history-date">${new Date(x.data_evento + "T12:00:00").toLocaleDateString("pt-BR")}</span>
        <div><h3>${x.titulo}</h3>
        <p>${[x.profissional, x.local, x.observacoes].filter(Boolean).join(" • ") || "Sem observações"}</p></div>
        <span class="type-pill">${x.tipo}</span>
      </article>`).join("")
    : '<div class="empty">Nenhum registro encontrado para este filtro.</div>';
}

const modal = document.getElementById("modalHistorico");
document.getElementById("novoHistorico").onclick = () => modal.classList.add("open");
document.getElementById("fecharHistorico").onclick = () => modal.classList.remove("open");

document.getElementById("filtroHistorico")?.addEventListener("change", () => {
  const petId = document.getElementById("petHistorico").value;
  if (petId) mostrar(petId);
});

document.getElementById("formHistorico").onsubmit = async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target).entries());
  d.usuario_id = petpetUsuario.id;

  try {
    const r = await fetch("/api/historico", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(d)
    });
    const j = await r.json();
    if (!r.ok) throw Error(j.mensagem || "Não foi possível salvar.");

    modal.classList.remove("open");
    e.target.reset();
    document.getElementById("msgHistorico").textContent = "";
    await mostrar(document.getElementById("petHistorico").value);
  } catch (err) {
    document.getElementById("msgHistorico").textContent = err.message;
  }
};

carregarHistorico();
if (tipoInicial) { const filtro = document.getElementById("filtroHistorico"); if (filtro) filtro.value = tipoInicial; }
