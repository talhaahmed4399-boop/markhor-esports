// =====================================
// MARKHOR ESPORTS MVP DISPLAY
// =====================================


const mvpClient =
window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);



async function loadCurrentMvp(){


const box =
document.getElementById(
"currentMvp"
);


if(!box) return;



const {
data,
error
}
=
await mvpClient
.from("mvp_match_stats")
.select("*");



if(error){

console.log(
"MVP ERROR",
error
);

box.innerHTML =
"MVP LOAD FAILED";

return;

}



if(!data || data.length===0){

box.innerHTML =
`
<div class="mvp-empty">

🏆

<h3>
NO MVP YET
</h3>

<p>
Tournament MVP will appear here
</p>

</div>
`;

return;

}



let players={};



data.forEach(
(stat)=>{


if(!players[stat.player_name]){


players[stat.player_name]={

name:stat.player_name,

team:stat.team_name,

tag:stat.team_tag,

kills:0,

damage:0,

matches:0

};


}



players[stat.player_name].kills +=
stat.kills;


players[stat.player_name].damage +=
stat.damage;


players[stat.player_name].matches++;

});



let mvp =
Object.values(players)
.sort(
(a,b)=>
b.kills-a.kills
)[0];



box.innerHTML =

`

<div class="mvp-card">


<div class="mvp-character">

🪖

</div>


<div class="mvp-info">


<span>
🏆 PLAYER OF THE MATCH
</span>


<h1>
${mvp.name}
</h1>


<h3>
${mvp.team}
</h3>


<div class="mvp-stats">


<div>
<b>${mvp.kills}</b>
<small>KILLS</small>
</div>


<div>
<b>${mvp.damage}</b>
<small>DAMAGE</small>
</div>


<div>
<b>${mvp.matches}</b>
<small>MATCHES</small>
</div>


</div>


</div>


</div>

`;

}


loadCurrentMvp();
