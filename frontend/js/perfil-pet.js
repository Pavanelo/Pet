const usuarioPerfil=JSON.parse(localStorage.getItem("petpet_usuario")||"null");
if(!usuarioPerfil) window.location.href="login.html";
const nomePet=document.getElementById("nomePet"), detalhes=document.getElementById("detalhesPet"), peso=document.getElementById("pesoPet"), foto=document.getElementById("fotoPet");
async function carregarPerfil(){
  try{
    const r=await fetch(`/api/pets?usuario_id=${usuarioPerfil.id}`); const j=await r.json();
    const pet=j.dados?.[0]; if(!pet){ window.location.href="cadastro-pet.html"; return; }
    localStorage.setItem("petpet_pet",JSON.stringify(pet)); document.getElementById("tituloPerfil").textContent=`Perfil de ${pet.nome}`; document.getElementById("subtituloPerfil").textContent=`Olá, ${usuarioPerfil.nome.split(" ")[0]}! Aqui você acompanha os cuidados de ${pet.nome}.`; nomePet.textContent=pet.nome; detalhes.textContent=[pet.especie,pet.raca,pet.sexo].filter(Boolean).join(" • ")||"Pet"; peso.textContent=pet.peso?`Peso: ${pet.peso} kg`:"Peso não informado";
  }catch(e){ document.getElementById("subtituloPerfil").textContent="Não foi possível carregar o perfil agora."; }
}
localStorage.removeItem("petpet_pet");window.location.href="login.html";});
carregarPerfil();
