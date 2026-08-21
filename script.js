const menuToggle=document.querySelector(".menu-toggle");
const nav=document.querySelector(".navbar nav");
if(menuToggle) menuToggle.addEventListener("click",()=>nav.classList.toggle("open"));

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click",e=>{
    const target=document.querySelector(a.getAttribute("href"));
    if(target){e.preventDefault();target.scrollIntoView({behavior:"smooth"});nav?.classList.remove("open")}
  });
});

const form=document.getElementById("registrationForm");
const msg=document.getElementById("formMessage");
if(form){
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const registrations=JSON.parse(localStorage.getItem("markhorRegistrations")||"[]");
    registrations.push({...data,submittedAt:new Date().toISOString()});
    localStorage.setItem("markhorRegistrations",JSON.stringify(registrations));
    msg.textContent="✓ REGISTRATION SAVED — MARKHOR ESPORTS WILL REVIEW YOUR ENTRY.";
    form.reset();
  });
}

const tickers=[
  "MARKHOR SHOWDOWN S1 — REGISTRATION IS NOW OPEN",
  "SEASON 01 LEADERBOARD — ROYAL ESPORTS LEADS",
  "NEXT MATCH — ERANGEL • 08:00 PM",
  "MARKHOR ESPORTS — COMPETE. CONQUER. RISE."
];
let tickerIndex=0;
const ticker=document.getElementById("tickerText");
setInterval(()=>{
  tickerIndex=(tickerIndex+1)%tickers.length;
  ticker.textContent=tickers[tickerIndex];
},3500);
