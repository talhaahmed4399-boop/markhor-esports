// =========================================
// MARKHOR BATTLEFIELD S1
// REGISTRATION SYSTEM
// =========================================

console.log("TOURNAMENT PAGE JS STARTED");


const tournamentClient =
    window.supabase.createClient(
        window.MARKHOR_CONFIG.supabaseUrl,
        window.MARKHOR_CONFIG.supabasePublishableKey
    );


const TOURNAMENT_ID =
    "12315134-ab7a-4705-baf6-92897fa09b50";


const registerBtn =
    document.getElementById(
        "registerTournamentBtn"
    );


console.log(
    "REGISTER BUTTON:",
    registerBtn
);


// =========================================
// BUTTON CLICK
// =========================================

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        function () {

            console.log(
                "REGISTER NOW CLICKED"
            );

            registerTeam();

        }
    );

} else {

    console.error(
        "REGISTER BUTTON NOT FOUND"
    );

}


// =========================================
// REGISTER TEAM
// =========================================

async function registerTeam() {

    registerBtn.disabled = true;

    registerBtn.textContent =
        "CHECKING...";


    // GET USER

    const {
        data: {
            user
        },
        error: userError
    } =
        await tournamentClient.auth.getUser();


    console.log(
        "CURRENT USER:",
        user
    );


    if (userError) {

        console.error(
            "USER ERROR:",
            userError
        );

        alert(
            "Login check failed."
        );

        resetRegisterButton();

        return;
    }


    // NOT LOGGED IN

    if (!user) {

        alert(
            "Please login first."
        );

        resetRegisterButton();

        return;
    }


    // =====================================
    // FIND CAPTAIN TEAM
    // =====================================

    registerBtn.textContent =
        "CHECKING TEAM...";


    const {
        data: membership,
        error: membershipError
    } =
        await tournamentClient
        .from("team_members")
        .select(
            "team_id, role"
        )
        .eq(
            "player_id",
            user.id
        )
        .eq(
            "role",
            "captain"
        )
        .maybeSingle();


    console.log(
        "CAPTAIN TEAM:",
        membership
    );


    if (membershipError) {

        console.error(
            "MEMBERSHIP ERROR:",
            membershipError
        );

        alert(
            "Team check failed:\n" +
            membershipError.message
        );

        resetRegisterButton();

        return;
    }


    if (!membership) {

        alert(
            "Only a team captain can register the team."
        );

        resetRegisterButton();

        return;
    }


    const teamId =
        membership.team_id;


    // =====================================
    // CHECK ALREADY REGISTERED
    // =====================================

    registerBtn.textContent =
        "CHECKING REGISTRATION...";


    const {
        data: existingRegistration,
        error: existingError
    } =
        await tournamentClient
        .from(
            "tournament_registrations"
        )
        .select("id")
        .eq(
            "tournament_id",
            TOURNAMENT_ID
        )
        .eq(
            "team_id",
            teamId
        )
        .maybeSingle();


    if (existingError) {

        console.error(
            "EXISTING REGISTRATION ERROR:",
            existingError
        );

        alert(
            "Registration check failed:\n" +
            existingError.message
        );

        resetRegisterButton();

        return;
    }


    if (existingRegistration) {

        alert(
            "Your team is already registered."
        );

        registerBtn.textContent =
            "TEAM REGISTERED ✓";

        return;
    }


    // =====================================
    // REGISTER
    // =====================================

    registerBtn.textContent =
        "REGISTERING...";


    const {
        data,
        error: registrationError
    } =
        await tournamentClient
        .from(
            "tournament_registrations"
        )
        .insert({

            tournament_id:
                TOURNAMENT_ID,

            team_id:
                teamId,

            registered_by:
                user.id,

            status:
                "registered"

        })
        .select();


    console.log(
        "REGISTRATION RESULT:",
        data
    );


    if (registrationError) {

        console.error(
            "REGISTRATION ERROR:",
            registrationError
        );

        alert(
            "Registration failed:\n\n" +
            registrationError.message
        );

        resetRegisterButton();

        return;
    }


    // =====================================
    // SUCCESS
    // =====================================

    alert(
        "🔥 TEAM REGISTERED SUCCESSFULLY!"
    );


    registerBtn.textContent =
        "TEAM REGISTERED ✓";

    registerBtn.disabled = true;


    // Refresh registered teams

    loadRegisteredTeams();

}


// =========================================
// RESET BUTTON
// =========================================

function resetRegisterButton() {

    registerBtn.disabled = false;

    registerBtn.textContent =
        "REGISTER NOW →";

}


// =========================================
// LOAD REGISTERED TEAMS
// =========================================

async function loadRegisteredTeams() {

    const {
        data,
        error
    } =
        await tournamentClient
        .from(
            "tournament_registrations"
        )
        .select(`
            id,
            team_id,
            status
        `)
        .eq(
            "tournament_id",
            TOURNAMENT_ID
        );


    console.log(
        "REGISTERED TEAMS:",
        data
    );


    if (error) {

        console.error(
            "REGISTERED TEAMS ERROR:",
            error
        );

        return;
    }


    const count =
        data ? data.length : 0;


    const countElement =
        document.getElementById(
            "registeredTeamsCount"
        );


    if (countElement) {

        countElement.textContent =
            count;

    }

}


// =========================================
// START
// =========================================

loadRegisteredTeams();
