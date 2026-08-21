const client = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);


/* =========================================
   ELEMENTS
========================================= */

const loading = document.getElementById("teamLoading");
const noTeamOptions = document.getElementById("noTeamOptions");
const myTeamOption = document.getElementById("myTeamOption");
const teamDescription = document.getElementById("teamDescription");

const myTeamTitle = document.getElementById("myTeamTitle");
const myTeamText = document.getElementById("myTeamText");


/* =========================================
   CHECK USER TEAM
========================================= */

async function checkUserTeam() {

    loading.style.display = "block";
    noTeamOptions.style.display = "none";
    myTeamOption.style.display = "none";

    teamDescription.textContent =
        "Checking your team status...";


    /* GET LOGGED-IN USER */

    const {
        data: userData,
        error: userError
    } = await client.auth.getUser();


    if (userError || !userData.user) {

        loading.style.display = "none";

        noTeamOptions.style.display = "grid";

        teamDescription.textContent =
            "Login to create or join an esports team.";

        return;
    }


    const user = userData.user;


    /* =====================================
       CHECK TEAM MEMBERSHIP
    ===================================== */

    const {
        data: membership,
        error: membershipError
    } = await client

        .from("team_members")

        .select(`
            id,
            team_id,
            player_id
        `)

        .eq("player_id", user.id)

        .limit(1)
        .maybeSingle();


    if (membershipError) {

        console.error(
            "Team membership error:",
            membershipError
        );

        loading.style.display = "none";

        noTeamOptions.style.display = "grid";

        teamDescription.textContent =
            "Choose an option to get started.";

        return;
    }


    /* =====================================
       USER HAS NO TEAM
    ===================================== */

    if (!membership) {

        loading.style.display = "none";

        noTeamOptions.style.display = "grid";

        teamDescription.textContent =
            "Build your team or find an esports organization to join.";

        return;
    }


    /* =====================================
       GET TEAM DETAILS
    ===================================== */

    const {
        data: team,
        error: teamError
    } = await client

        .from("teams")

        .select(`
            id,
            name,
            tag
        `)

        .eq("id", membership.team_id)

        .maybeSingle();


    if (teamError || !team) {

        console.error(
            "Team details error:",
            teamError
        );

        loading.style.display = "none";

        noTeamOptions.style.display = "grid";

        teamDescription.textContent =
            "Build your team or find an esports organization to join.";

        return;
    }


    /* =====================================
       SHOW MY TEAM
    ===================================== */

    loading.style.display = "none";

    myTeamOption.style.display = "grid";

    teamDescription.textContent =
        "Your registered esports organization.";


    myTeamTitle.textContent =
        team.name || "MY TEAM";


    myTeamText.textContent =
        `${team.tag || ""} • Manage your roster, ranking and team chat.`;


}


/* =========================================
   START
========================================= */

checkUserTeam();
