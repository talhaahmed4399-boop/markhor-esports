const tournamentClient = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);


// APNA TOURNAMENT ID YAHAN LAGANA
const TOURNAMENT_ID = "YOUR_TOURNAMENT_ID";


const registerBtn =
document.getElementById("registerTournamentBtn");


if(registerBtn){

    registerBtn.addEventListener(
        "click",
        registerTeam
    );

}


async function registerTeam(){

    registerBtn.disabled = true;

    registerBtn.innerHTML =
    "CHECKING...";


    const {
        data:{
            user
        }
    } =
    await tournamentClient.auth.getUser();


    if(!user){

        alert(
        "Please login first."
        );

        resetButton();

        return;

    }



    // captain team check

    const {
        data:teamMember
    } =
    await tournamentClient
    .from("team_members")
    .select(`
        team_id,
        role
    `)
    .eq(
        "player_id",
        user.id
    )
    .eq(
        "role",
        "captain"
    )
    .maybeSingle();



    if(!teamMember){

        alert(
        "Only captain can register team."
        );

        resetButton();

        return;

    }



    // duplicate check

    const {
        data:already
    } =
    await tournamentClient
    .from("tournament_registrations")
    .select("id")
    .eq(
        "tournament_id",
        TOURNAMENT_ID
    )
    .eq(
        "team_id",
        teamMember.team_id
    )
    .maybeSingle();



    if(already){

        alert(
        "Your team is already registered."
        );

        registerBtn.innerHTML =
        "ALREADY REGISTERED ✓";

        return;

    }



    registerBtn.innerHTML =
    "REGISTERING...";



    const {
        error
    } =
    await tournamentClient
    .from("tournament_registrations")
    .insert({

        tournament_id:
        TOURNAMENT_ID,

        team_id:
        teamMember.team_id,

        registered_by:
        user.id,

        status:
        "registered"

    });



    if(error){

        console.error(error);

        alert(
        error.message
        );

        resetButton();

        return;

    }



    alert(
    "TEAM REGISTERED SUCCESSFULLY 🔥"
    );


    registerBtn.innerHTML =
    "TEAM REGISTERED ✓";

}



function resetButton(){

    registerBtn.disabled=false;

    registerBtn.innerHTML =
    "REGISTER NOW →";

}
