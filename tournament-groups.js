/* =========================================
   MARKHOR ESPORTS
   TOURNAMENT GROUP SYSTEM
========================================= */


/* SUPABASE */

const client = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);


/* ELEMENTS */

const groupsContainer =
    document.getElementById("groupsContainer");


const totalRegistered =
    document.getElementById("totalRegistered");



/* TOURNAMENT ID */

let tournamentId = null;



/* =========================================
   GET TOURNAMENT
========================================= */

async function getTournament() {


    const {
        data,
        error
    } = await client
        .from("tournaments")
        .select("id")
        .eq(
            "name",
            "MARKHOR BATTLEFIELD SEASON 1"
        )
        .single();



    if(error){

        console.error(
            "Tournament error:",
            error
        );

        return;

    }



    tournamentId =
        data.id;



    loadGroups();

}




/* =========================================
   LOAD GROUPS
========================================= */

async function loadGroups(){


    const {

        data: registrations,

        error

    } = await client
        .from("tournament_registrations")
        .select(`
        
            id,
            team_id,
            status,
            group_name,
            group_position,

            teams(

                name,
                tag,
                logo_url

            )

        `)
        .eq(
            "tournament_id",
            tournamentId
        )
        .order(
            "created_at",
            {
                ascending:true
            }
        );



    if(error){

        console.error(
            "Registration error:",
            error
        );

        return;

    }



    let teams =
        registrations || [];



    if(totalRegistered){

        totalRegistered.textContent =
            teams.length;

    }



    createGroups(
        teams
    );


}



/* =========================================
   CREATE GROUPS
========================================= */


function createGroups(
    teams
){


    if(!groupsContainer)
        return;



    groupsContainer.innerHTML =
        "";



    const groups =
        "ABCDEFGHIJKLMNOP".split("");



    groups.forEach(

        group => {


            const groupTeams =
                teams.filter(

                    team =>
                    team.group_name ===
                    "GROUP " + group

                );



            const groupCard =
                document.createElement(
                    "div"
                );



            groupCard.className =
                "group-card";



            groupCard.innerHTML = `


            <div class="group-header">

                <small>
                    MARKHOR BATTLEFIELD S1
                </small>


                <h2>
                    GROUP ${group}
                </h2>


                <span>
                    ${groupTeams.length}/16 TEAMS
                </span>


            </div>



            <div class="group-team-list">


            ${
                createTeamCards(
                    groupTeams
                )
            }


            </div>


            `;



            groupsContainer.appendChild(
                groupCard
            );


        }

    );


}




/* =========================================
   TEAM CARDS
========================================= */


function createTeamCards(
    teams
){


    let html = "";



    if(
        teams.length === 0
    ){


        html = `

        <div class="empty-slot">

            WAITING FOR TEAMS

        </div>

        `;


        return html;


    }



    teams.forEach(

        item => {


            const team =
                item.teams;



            html += `


            <div class="registered-team-card">


                <div class="team-logo">


                ${
                    team.logo_url

                    ?

                    `
                    <img
                    src="${team.logo_url}"
                    >
                    `

                    :

                    `
                    <span>
                    M
                    </span>
                    `

                }


                </div>



                <div class="team-info">


                    <h3>

                    ${team.name}

                    </h3>



                    <p>

                    #${team.tag || "TEAM"}

                    </p>



                </div>


            </div>


            `;


        }

    );



    return html;


}





/* =========================================
   REALTIME UPDATE
========================================= */


function startRealtime(){


    client

    .channel(
        "tournament-groups"
    )

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:
            "tournament_registrations"

        },


        ()=>{

            loadGroups();

        }

    )

    .subscribe();


}




/* START */


getTournament();

startRealtime();
