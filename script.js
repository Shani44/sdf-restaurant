// Replace this demo number with your real WhatsApp Business number.
// Pakistan: 923262946545 -> 923262946545
const WHATSAPP_NUMBER = "923262946545";

function whatsapp(message){
  window.open("https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(message),"_blank");
}
document.querySelectorAll("[data-wa]").forEach(el=>{
  el.addEventListener("click",e=>{e.preventDefault();whatsapp(el.dataset.wa);});
});
document.querySelectorAll(".order").forEach(btn=>{
  btn.addEventListener("click",()=>{
    whatsapp("Hi SDF Restaurant! 👋\n\nI want to order:\n🍽️ "+btn.dataset.item+"\n💰 Price: Rs. "+btn.dataset.price+"\n\nPlease help me complete my order.");
  });
});
document.querySelectorAll(".cats button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".cats button").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    const f=btn.dataset.filter;
    document.querySelectorAll(".food").forEach(card=>{
      card.style.display=(f==="all"||card.dataset.cat===f)?"":"none";
    });
  });
});
