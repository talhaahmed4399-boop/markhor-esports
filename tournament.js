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
// =========================================
// FIND NEXT GROUP
// =========================================

const {
    data: registrations,
    error: countError
} = await tournamentClient
    .from("tournament_registrations")
    .select("id")
    .eq(
        "tournament_id",
        TOURNAMENT_ID
    );


if (countError) {

    console.error(
        "GROUP COUNT ERROR:",
        countError
    );

    alert(
        "Unable to assign tournament group."
    );

    resetRegisterButton();

    return;
}


// =========================================
// CHECK 256 TEAM LIMIT
// =========================================

if (
    registrations &&
    registrations.length >= 256
) {

    alert(
        "Tournament registration is full. 256 teams have already registered."
    );

    resetRegisterButton();

    return;
}


// =========================================
// AUTOMATIC GROUP
// =========================================

const teamNumber =
    (registrations?.length || 0) + 1;


const groupIndex =
    Math.floor(
        (teamNumber - 1) / 16
    );


const groupLetter =
    String.fromCharCode(
        65 + groupIndex
    );


const groupName =
    "Group " + groupLetter;


console.log(
    "TEAM NUMBER:",
    teamNumber
);

console.log(
    "ASSIGNED GROUP:",
    groupName
);

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

    console.log("LOADING GROUPS...");

    const {
        data,
        error
    } = await tournamentClient
        .from("tournament_registrations")
        .select(`
            id,
            team_id,
            group_name,
            status,
            created_at,
            teams (
                id,
                name,
                tag,
                logo_url
            )
        `)
        .eq(
            "tournament_id",
            TOURNAMENT_ID
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    console.log(
        "GROUP DATA:",
        data
    );

    console.log(
        "GROUP ERROR:",
        error
    );


    if (error) {

        console.error(
            "GROUP LOAD ERROR:",
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


    const list =
        document.getElementById(
            "registeredTeamsList"
        );


    if (!list) {

        console.error(
            "registeredTeamsList NOT FOUND"
        );

        return;
    }


    if (!data || data.length === 0) {

        list.innerHTML = `

            <div class="loading-teams">

                NO TEAMS REGISTERED YET

            </div>

        `;

        return;
    }


    // =====================================
    // GROUPS A - P
    // =====================================

    const groups = {};

    for (
        let i = 0;
        i < 16;
        i++
    ) {

        const letter =
            String.fromCharCode(
                65 + i
            );

        groups[
            "Group " + letter
        ] = [];

    }


    // =====================================
    // PUT TEAMS INTO GROUPS
    // =====================================

    data.forEach(
        registration => {

            const group =
                registration.group_name;


            if (
                group &&
                groups[group]
            ) {

                groups[group].push(
                    registration
                );

            }

        }
    );


    list.innerHTML = "";


    // =====================================
    // DISPLAY GROUPS
    // =====================================

    Object.keys(groups).forEach(
        groupName => {

            const teams =
                groups[groupName];


            // Hide empty groups

            if (
                teams.length === 0
            ) {

                return;

            }


            let groupHTML = `

                <div class="tournament-group">

                    <div class="group-header">

                        <div>

                            <small>
                                MARKHOR BATTLEFIELD S1
                            </small>

                            <h3>
                                ${groupName}
                            </h3>

                        </div>

                        <strong>
                            ${teams.length} / 16
                        </strong>

                    </div>


                    <div class="group-teams">

            `;


            teams.forEach(
                (
                    registration,
                    index
                ) => {

                    const team =
                        registration.teams;


                    if (!team) {
                        return;
                    }


                    const logo =
                        team.logo_url

                        ?

                        `
                        <img
                            src="${team.logo_url}"
                            alt="${team.name}"
                        >
                        `

                        :

                        `
                        <span class="team-logo-text">
                            ${team.tag || "TEAM"}
                        </span>
                        `;


                    groupHTML += `

                        <div class="registered-team-card">

                            <div class="registered-team-number">

                                ${String(
                                    index + 1
                                ).padStart(
                                    2,
                                    "0"
                                )}

                            </div>


                            <div class="registered-team-logo">

                                ${logo}

                            </div>


                            <div class="registered-team-info">

                                <strong>
                                    ${team.name}
                                </strong>

                                <small>
                                    ${team.tag || ""}
                                </small>

                            </div>


                            <div class="registered-team-status">

                                REGISTERED ✓

                            </div>

                        </div>

                    `;

                }
            );


            groupHTML += `

                    </div>

                </div>

            `;


            list.innerHTML +=
                groupHTML;

        }
    );

}

// =========================================
// START
// =========================================

loadRegisteredTeams();
