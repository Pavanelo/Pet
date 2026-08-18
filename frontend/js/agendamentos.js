
let pets = [], agendamentos = [], mesAtual = new Date();

const fmtMonth = d => d.toLocaleDateString("pt-BR", {month:"long", year:"numeric"})
  .replace(/^./, x => x.toUpperCase());

async function carregar() {
  try {
    const pr = await fetch(`/api/pets?usuario_id=${encodeURIComponent(petpetUsuario.id)}`);
    const pj = await pr.json();
    pets = pj.dados || [];

    const sel = document.getElementById("petAgenda");
    sel.innerHTML = pets.map(p => `<option value="${p.id}">${p.nome}</option>`).join("");
    document.getElementById("petAgendaNome").textContent = pets[0] ? pets[0].nome : "";

    if (!pets.length) {
      document.getElementById("listaAgendamentos").innerHTML =
        '<div class="empty">Cadastre um pet primeiro.</div>';
      return;
    }

    const ar = await fetch(`/api/agendamentos?usuario_id=${encodeURIComponent(petpetUsuario.id)}`);
    const aj = await ar.json();
    agendamentos = aj.dados || [];
    render();
  } catch (e) {
    document.getElementById("listaAgendamentos").innerHTML =
      '<div class="empty">Não foi possível carregar os agendamentos.</div>';
  }
}

function render() {
  const y = mesAtual.getFullYear(), m = mesAtual.getMonth();
  document.getElementById("mesTitulo").textContent = fmtMonth(mesAtual);

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  for (let i = 0; i < first; i++) {
    grid.innerHTML += '<button class="day muted" disabled></button>';
  }

  for (let d = 1; d <= days; d++) {
    const has = agendamentos.some(a => {
      const x = new Date(a.data_hora);
      return x.getFullYear() === y && x.getMonth() === m && x.getDate() === d;
    });
    const today = new Date();
    const isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
    grid.innerHTML += `<button class="day ${has ? "has-event" : ""} ${isToday ? "today" : ""}" data-day="${d}">${d}</button>`;
  }

  const list = agendamentos
    .filter(a => new Date(a.data_hora) >= new Date())
    .sort((a,b) => new Date(a.data_hora) - new Date(b.data_hora))
    .slice(0, 6);

  document.getElementById("listaAgendamentos").innerHTML = list.length
    ? list.map(a => {
        const d = new Date(a.data_hora);
        return `<article class="agenda-item">
          <div class="agenda-date"><strong>${String(d.getDate()).padStart(2,"0")}</strong>
          <small>${d.toLocaleDateString("pt-BR",{month:"short"}).replace(".","").toUpperCase()}</small></div>
          <div><h3>${a.titulo}</h3>
          <p>${d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} • ${a.local || "Local não informado"} • ${a.pet_nome}</p>
          </div><span class="status">${a.status}</span></article>`;
      }).join("")
    : '<div class="empty">Nenhum agendamento futuro. Clique em “Novo agendamento”.</div>';
}

document.getElementById("mesAnterior").onclick = () => {
  mesAtual.setMonth(mesAtual.getMonth() - 1);
  render();
};
document.getElementById("mesProximo").onclick = () => {
  mesAtual.setMonth(mesAtual.getMonth() + 1);
  render();
};

const modal = document.getElementById("modalAgendamento");
document.getElementById("novoAgendamento").onclick = () => modal.classList.add("open");
document.getElementById("fecharModal").onclick = () => modal.classList.remove("open");

document.getElementById("formAgendamento").onsubmit = async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target).entries());
  d.usuario_id = petpetUsuario.id;

  try {
    const r = await fetch("/api/agendamentos", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(d)
    });
    const j = await r.json();
    if (!r.ok) throw Error(j.mensagem || "Não foi possível salvar.");

    modal.classList.remove("open");
    e.target.reset();

    // The backend has already created the linked health-history entry.
    const aviso = document.getElementById("msgAgenda");
    aviso.textContent = "Agendamento salvo e conectado ao histórico de saúde.";
    aviso.className = "mensagem sucesso";

    await carregar();
  } catch (err) {
    document.getElementById("msgAgenda").textContent = err.message;
  }
};

carregar();
