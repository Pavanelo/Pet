async function carregarConta(){
  if(!petpetUsuario) return;
  document.getElementById("nomeTutor").textContent=petpetUsuario.nome||"Tutor";
  document.getElementById("nomeTutorTitulo").textContent=(petpetUsuario.nome||"tutor").split(" ")[0];
  document.getElementById("emailTutor").textContent=petpetUsuario.email||"—";
  document.getElementById("contatoTutor").textContent=petpetUsuario.contato||"—";
  document.getElementById("cargoTutor").textContent=petpetUsuario.cargo||"Tutor";
  try{const r=await fetch(`/api/pets?usuario_id=${petpetUsuario.id}`);const j=await r.json();const pet=j.dados?.[0];if(pet){localStorage.setItem("petpet_pet",JSON.stringify(pet));document.getElementById("nomeContaPet").textContent=pet.nome;document.getElementById("detalhesContaPet").textContent=[pet.especie,pet.raca,pet.sexo].filter(Boolean).join(" • ")||"Pet";}}catch(e){}
}
carregarConta();
