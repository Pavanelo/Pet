const usuario = JSON.parse(localStorage.getItem("petpet_usuario") || sessionStorage.getItem("petpet_usuario") || "null");
const formPet = document.getElementById("formCadastrarPet");
const msgPet = document.getElementById("mensagemPet");
const botaoPet = document.getElementById("botaoPet");
if(!usuario){ window.location.href="login.html"; }
function msg(texto,tipo="erro"){ msgPet.textContent=texto; msgPet.className=`mensagem ${tipo}`; }
formPet?.addEventListener("submit",async(e)=>{
  e.preventDefault(); botaoPet.disabled=true; botaoPet.textContent="Salvando pet...";
  const dados=Object.fromEntries(new FormData(formPet).entries()); dados.usuario_id=usuario.id; dados.castrado=formPet.querySelector('[name="castrado"]').checked;
  if(dados.peso==="") dados.peso=null; if(dados.data_nascimento==="") dados.data_nascimento=null;
  try{
    const r=await fetch("/api/pets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(dados)}); const j=await r.json(); if(!r.ok) throw new Error(j.erro ? `${j.mensagem}: ${j.erro}` : (j.mensagem||"Não foi possível salvar o pet."));
    localStorage.setItem("petpet_pet",JSON.stringify(j.dados)); window.location.href="perfil-pet.html";
  }catch(err){msg(err.message); botaoPet.disabled=false; botaoPet.textContent="Salvar e ver perfil";}
});
