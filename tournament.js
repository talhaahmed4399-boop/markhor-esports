const tournamentClient = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);


const tournamentBox =
document.getElementById("dynamicTournaments");


async function loadTournaments(){


    if(!tournamentBox)
    return;


    const {
        data,
        error
    } =
    await tournamentClient
    .from("tournaments")
    .select("*")
    .order(
        "created_at",
        {
            ascending:false
        }
    );


    if(error){

        console.error(error);
        return;

    }



    tournamentBox.innerHTML = "";



    data.forEach(tournament => {


        tournamentBox.innerHTML += `


        <article>


        <div class="cover c1">

        ${tournament.registration_status.toUpperCase()}

        </div>



        <div class="body">


        <small>
        PUBG MOBILE • SQUAD
        </small>


        <h3>
        ${tournament.name}
        </h3>



        <div class="meta">


        <span>
        PRIZE

        <strong>
        ₨${tournament.prize_pool}
        </strong>

        </span>



        <span>

        TEAMS

        <strong>

        ${tournament.max_teams}

        </strong>

        </span>



        <span>

        STATUS

        <strong>

        ${tournament.tournament_status}

        </strong>

        </span>


        </div>



        <a 
        class="outline full"
        href="tournament.html">

        VIEW TOURNAMENT →

        </a>


        </div>


        </article>


        `;


    });


}



loadTournaments();
