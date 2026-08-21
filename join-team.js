const client = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);

const teamsList = document.getElementById("teamsList");
const searchInput = document.getElementById("teamSearch");
const refreshButton = document.getElementById("refreshTeams");
const message = document.getElementById("joinMessage");

let allTeams = [];


/* ================================
   GET CURRENT USER
================================ */

async function getCurrentUser() {

    const {
        data,
        error
    } = await client.auth.getUser();

    if (error || !data.user) {
        return null;
    }

    return data.user;
}


/* ================================
   LOAD TEAMS
================================ */

async function loadTeams() {

    teamsList.innerHTML =
        '<div class="team-loading">Loading registered teams...</div>';

    message.textContent = "";

    const {
        data: teams,
        error
    } = await client
        .from("teams")
        .select(`
            id,
            name,
            tag,
            logo_url,
            captain_id,
            igl_name,
            player1_name,
            player2_name,
            player3_name,
            player4_name
        `)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        teamsList.innerHTML =
            '<div class="team-loading">Unable to load teams.</div>';

        message.textContent =
            error.message;

        return;
    }


    allTeams = teams || [];

    renderTeams(allTeams);
}


/* ================================
   RENDER TEAMS
================================ */

function renderTeams(teams) {

    if (!teams.length) {

        teamsList.innerHTML = `
            <div class="team-loading">
                No registered teams found.
            </div>
        `;

        return;
    }


    teamsList.innerHTML = "";


    teams.forEach(team => {

        const card =
            document.createElement("div");

        card.className =
            "join-team-card";


        const logo =
            team.logo_url
                ? `<img src="${escapeHtml(team.logo_url)}" alt="Team Logo">`
                : `<div class="join-team-logo">${escapeHtml(team.tag || "M")}</div>`;


        const players = [

            team.player1_name,
            team.player2_name,
            team.player3_name,
            team.player4_name

        ].filter(Boolean);


        card.innerHTML = `

            <div class="join-team-top">

                <div class="join-team-logo-wrap">

                    ${logo}

                </div>


                <div class="join-team-title">

                    <small>REGISTERED TEAM</small>

                    <h2>
                        ${escapeHtml(team.name)}
                    </h2>

                    <span>
                        ${escapeHtml(team.tag)}
                    </span>

                </div>

            </div>


            <div class="join-team-info">

                <div>

                    <small>IGL</small>

                    <strong>
                        ${escapeHtml(team.igl_name || "Not provided")}
                    </strong>

                </div>


                <div>

                    <small>ROSTER</small>

                    <strong>
                        ${players.length}/4
                    </strong>

                </div>

            </div>


            <button
                class="lime full requestJoinBtn"
                data-team-id="${team.id}"
            >

                REQUEST TO JOIN

            </button>

        `;


        teamsList.appendChild(card);

    });


    document
        .querySelectorAll(".requestJoinBtn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => requestToJoin(button.dataset.teamId)
            );

        });

}


/* ================================
   REQUEST TO JOIN
================================ */

async function requestToJoin(teamId) {

    const user =
        await getCurrentUser();


    if (!user) {

        message.textContent =
            "Please login before requesting to join a team.";

        return;
    }


    const button =
        document.querySelector(
            `[data-team-id="${teamId}"]`
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "SENDING REQUEST...";

    }


    try {

        const {
            data: existingMember,
            error: memberError
        } = await client
            .from("team_members")
            .select("id")
            .eq("team_id", teamId)
            .eq("player_id", user.id)
            .maybeSingle();


        if (memberError) {
            throw memberError;
        }


        if (existingMember) {

            message.textContent =
                "You are already a member of this team.";

            resetButton(button);

            return;
        }


        const {
            data: existingRequest,
            error: requestCheckError
        } = await client
            .from("team_join_requests")
            .select("id,status")
            .eq("team_id", teamId)
            .eq("player_id", user.id)
            .maybeSingle();


        if (requestCheckError) {
            throw requestCheckError;
        }


        if (existingRequest) {

            if (existingRequest.status === "pending") {

                message.textContent =
                    "Your join request is already pending.";

            } else {

                message.textContent =
                    "You already have a request for this team.";

            }

            resetButton(button);

            return;
        }


        const {
            error
        } = await client
            .from("team_join_requests")
            .insert({

                team_id: teamId,

                player_id: user.id,

                status: "pending"

            });


        if (error) {
            throw error;
        }


        message.textContent =
            "Join request sent successfully.";

        if (button) {

            button.textContent =
                "REQUEST SENT ✓";

            button.disabled = true;

        }


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Unable to send join request.";

        resetButton(button);

    }

}


/* ================================
   SEARCH
================================ */

searchInput.addEventListener(
    "input",
    function () {

        const search =
            this.value
                .trim()
                .toLowerCase();


        if (!search) {

            renderTeams(allTeams);

            return;
        }


        const filtered =
            allTeams.filter(team =>

                (team.name || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (team.tag || "")
                    .toLowerCase()
                    .includes(search)

            );


        renderTeams(filtered);

    }
);


/* ================================
   REFRESH
================================ */

refreshButton.addEventListener(
    "click",
    loadTeams
);


/* ================================
   BUTTON RESET
================================ */

function resetButton(button) {

    if (!button) {
        return;
    }

    button.disabled = false;

    button.textContent =
        "REQUEST TO JOIN";

}


/* ================================
   HTML SECURITY
================================ */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ================================
   START
================================ */

loadTeams();
