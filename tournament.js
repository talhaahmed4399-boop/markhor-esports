/* =========================================
   MARKHOR ESPORTS
   TOURNAMENT REGISTRATION SYSTEM
========================================= */


/* SUPABASE */

const client = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);



const registerBtn =
document.getElementById(
    "registerTournamentBtn"
);



let currentUser = null;

let tournament = null;



/* =========================================
   LOAD USER
========================================= */

async function getUser(){


    const {
        data,
        error
    } =
    await client.auth.getUser();



    if(error || !data.user){

        alert(
            "Please login first."
        );

        return null;

    }


    currentUser =
    data.user;


    return currentUser;

}




/* =========================================
   GET TOURNAMENT
========================================= */


async function getTournament(){


    const {
        data,
        error
    }
    =
    await client
    .from("tournaments")
    .select("*")
    .eq(
        "name",
        "MARKHOR BATTLEFIELD SEASON 1"
    )
    .single();



    if(error){

        console.error(error);

        return;

    }


    tournament =
    data;


}





/* =========================================
   GET MY TEAM
========================================= */


async function getMyTeam(){


    const {

        data,

        error

    }
    =
    await client
    .from("team_members")
    .select(`
        team_id,
        role,
        teams(
            id,
            name,
            tag
        )
    `)
    .eq(
        "player_id",
        currentUser.id
    )
    .eq(
        "role",
        "captain"
    )
    .maybeSingle();



    if(error){

        console.error(error);

        return null;

    }


    return data;


}






/* =========================================
   FIND GROUP
========================================= */


async function getNextGroup(){


    const {

        data,

        error

    }
    =
    await client
    .from(
        "tournament_registrations"
    )
    .select(
        "group_name,group_position"
    )
    .eq(
        "tournament_id",
        tournament.id
    )
    .order(
        "created_at",
        {
            ascending:false
        }
    );



    if(error){

        console.error(error);

        return null;

    }



    let position =
    data.length + 1;



    let groupIndex =
    Math.floor(
        (position - 1) / 16
    );



    let slot =
    ((position - 1) % 16) + 1;



    let letters =
    "ABCDEFGHIJKLMNOP";



    return {

        group_name:
        "GROUP " +
        letters[groupIndex],

        group_position:
        slot

    };


}





/* =========================================
   REGISTER TEAM
========================================= */


async function registerTeam(){



    await getTournament();



    const user =
    await getUser();



    if(!user)
    return;



    const team =
    await getMyTeam();



    if(!team){

        alert(
            "Only team captains can register."
        );

        return;

    }




    /* CHECK DUPLICATE */


    const {
        data:exist
    }
    =
    await client
    .from(
        "tournament_registrations"
    )
    .select("id")
    .eq(
        "tournament_id",
        tournament.id
    )
    .eq(
        "team_id",
        team.team_id
    )
    .maybeSingle();



    if(exist){

        alert(
            "Your team is already registered."
        );

        return;

    }




    /* GET GROUP */


    const group =
    await getNextGroup();



    if(!group){

        alert(
            "Unable to create group."
        );

        return;

    }




    /* INSERT */


    const {
        error
    }
    =
    await client
    .from(
        "tournament_registrations"
    )
    .insert({

        tournament_id:
        tournament.id,

        team_id:
        team.team_id,

        registered_by:
        currentUser.id,

        status:
        "approved",

        group_name:
        group.group_name,

        group_position:
        group.group_position

    });




    if(error){

        console.error(
            error
        );

        alert(
            "Registration failed."
        );

        return;

    }



    alert(
        "Team registered successfully!"
    );



    window.location.href =
    "tournament-groups.html";


}




/* =========================================
   BUTTON
========================================= */


if(registerBtn){

    registerBtn.addEventListener(
        "click",
        registerTeam
    );

}
