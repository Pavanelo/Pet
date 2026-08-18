
(function () {
  const raw = localStorage.getItem("petpet_usuario") || sessionStorage.getItem("petpet_usuario");
  const petpetUsuario = raw ? JSON.parse(raw) : null;

  if (!petpetUsuario) {
    window.location.href = "login.html";
    return;
  }

  window.petpetUsuario = petpetUsuario;

  const navNome = document.getElementById("nomeContaNav");
  if (navNome) navNome.textContent = (petpetUsuario.nome || "Minha conta").split(" ")[0];

  document.getElementById("sair")?.addEventListener("click", () => {
    localStorage.removeItem("petpet_usuario");
    localStorage.removeItem("petpet_pet");
    localStorage.removeItem("petpet_pet_id");
    sessionStorage.removeItem("petpet_usuario");
    window.location.href = "login.html";
  });

  // Keep the selected pet synchronized with the database after login/refresh.
  fetch(`/api/pets?usuario_id=${encodeURIComponent(petpetUsuario.id)}`)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      const pet = data?.dados?.[0];
      if (pet) {
        localStorage.setItem("petpet_pet", JSON.stringify(pet));
        localStorage.setItem("petpet_pet_id", String(pet.id));
      }
    })
    .catch(() => {});
})();
