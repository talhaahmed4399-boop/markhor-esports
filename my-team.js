const client = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);


/* =========================================
   BASIC ELEMENTS
========================================= */

const message = document.getElementById("teamPageMessage");
const container = document.getElementById("myTeamContainer");


/* =========================================
   HELPER
========================================= */

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent =
            value || "-";
    }
}


/* =========================================
   LOAD MY TEAM
========================================= */

async function loadMyTeam() {

    try {

        message.textContent =
            "Loading your team...";


        /* GET CURRENT USER */

        const {
            data: userData,
            error: userError
        } = await client.auth.getUser();


        if (userError || !userData.user) {

            message.textContent =
                "Please login to view your team.";

            return;
        }


        const user = userData.user;


        /* =====================================
           FIND TEAM MEMBERSHIP
        ===================================== */

        const {
            data: membership,
            error: memberError
        } = await client

            .from("team_members")

            .select("team_id")

            .eq("player_id", user.id)

            .limit(1)
            .maybeSingle();


        if (memberError) {

            console.error(memberError);

            message.textContent =
                "Unable to load team membership.";

            return;
        }


        if (!membership) {

            message.textContent =
                "You are not a member of any team.";

            return;
        }


        /* =====================================
           LOAD TEAM
        ===================================== */

        const {
            data: team,
            error: teamError
        } = await client

            .from("teams")

            .select("*")

            .eq("id", membership.team_id)

            .maybeSingle();


        if (teamError) {

            console.error(teamError);

            message.textContent =
                "Unable to load team.";

            return;
        }


        if (!team) {

            message.textContent =
                "Team not found.";

            return;
        }


        /* =====================================
           SHOW PAGE
        ===================================== */

        message.style.display =
            "none";

        container.style.display =
            "block";


        /* =====================================
           TEAM BASIC INFORMATION
        ===================================== */

        setText(
            "myTeamName",
            team.name
        );


        setText(
            "myTeamTag",
            team.tag
        );


        setText(
            "myTeamIGL",
            team.igl || team.captain_name
        );


        setText(
            "myTeamWhatsapp",
            team.whatsapp
        );


        /* =====================================
           TEAM LOGO
        ===================================== */

        const logo =
            document.getElementById("myTeamLogo");


        if (logo && team.team_logo) {

            logo.innerHTML =
                `<img src="${team.team_logo}" alt="Team Logo">`;

        }


        /* =====================================
           TEAM STATS
        ===================================== */

        setText(
            "teamRank",
            team.rank ? "#" + team.rank : "#--"
        );


        setText(
            "teamPoints",
            team.points || 0
        );


        setText(
            "teamMatches",
            team.matches || 0
        );


        setText(
            "teamKills",
            team.kills || 0
        );


        setText(
            "teamWins",
            team.wwcd || 0
        );


        /* =====================================
           PLAYER 1
        ===================================== */

        setText(
            "p1Name",
            team.player1_name
        );


        setText(
            "p1Uid",
            team.player1_uid
                ? "PUBG UID: " + team.player1_uid
                : "PUBG UID: -"
        );


        /* =====================================
           PLAYER 2
        ===================================== */

        setText(
            "p2Name",
            team.player2_name
        );


        setText(
            "p2Uid",
            team.player2_uid
                ? "PUBG UID: " + team.player2_uid
                : "PUBG UID: -"
        );


        /* =====================================
           PLAYER 3
        ===================================== */

        setText(
            "p3Name",
            team.player3_name
        );


        setText(
            "p3Uid",
            team.player3_uid
                ? "PUBG UID: " + team.player3_uid
                : "PUBG UID: -"
        );


        /* =====================================
           PLAYER 4
        ===================================== */

        setText(
            "p4Name",
            team.player4_name
        );


        setText(
            "p4Uid",
            team.player4_uid
                ? "PUBG UID: " + team.player4_uid
                : "PUBG UID: -"
        );


        /* =====================================
           SUBSTITUTE 1
        ===================================== */

        setText(
            "sub1Name",
            team.sub1_name || "No Substitute"
        );


        setText(
            "sub1Uid",
            team.sub1_uid
                ? "PUBG UID: " + team.sub1_uid
                : "PUBG UID: -"
        );


        /* =====================================
           SUBSTITUTE 2
        ===================================== */

        setText(
            "sub2Name",
            team.sub2_name || "No Substitute"
        );


        setText(
            "sub2Uid",
            team.sub2_uid
                ? "PUBG UID: " + team.sub2_uid
                : "PUBG UID: -"
        );


        /* =====================================
           ROSTER COUNT
        ===================================== */

        let rosterCount = 0;

        if (team.player1_name) rosterCount++;
        if (team.player2_name) rosterCount++;
        if (team.player3_name) rosterCount++;
        if (team.player4_name) rosterCount++;


        setText(
            "myTeamRoster",
            rosterCount + " / 4"
        );


        /* =====================================
           CHAT
        ===================================== */

        loadTeamMessages(
            membership.team_id,
            user.id
        );


    } catch (error) {

        console.error(error);

        message.textContent =
            "Something went wrong while loading your team.";

    }

}


/* =========================================
   LOAD TEAM CHAT
========================================= */

async function loadTeamMessages(teamId, userId) {

    const chat =
        document.getElementById(
            "teamChatMessages"
        );


    if (!chat) return;


    const {
        data: messages,
        error
    } = await client

        .from("team_messages")

        .select("*")

        .eq("team_id", teamId)

        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Chat error:",
            error
        );

        return;
    }


    if (!messages || messages.length === 0) {

        return;

    }


    chat.innerHTML = "";


    messages.forEach(msg => {

        const item =
            document.createElement("div");


        item.className =
            "team-chat-message";


        item.innerHTML = `

            <strong>
                ${msg.player_id === userId
                    ? "You"
                    : "Team Member"}
            </strong>

            <p>
                ${escapeHtml(msg.message)}
            </p>

        `;


        chat.appendChild(item);

    });


    chat.scrollTop =
        chat.scrollHeight;

}


/* =========================================
   SEND TEAM MESSAGE
========================================= */

async function sendTeamMessage() {

    const input =
        document.getElementById(
            "teamChatInput"
        );


    if (!input) return;


    const text =
        input.value.trim();


    if (!text) return;


    const {
        data: userData
    } = await client.auth.getUser();


    if (!userData.user) {

        alert(
            "Please login first."
        );

        return;
    }


    const user =
        userData.user;


    const {
        data: membership
    } = await client

        .from("team_members")

        .select("team_id")

        .eq("player_id", user.id)

        .limit(1)
        .maybeSingle();


    if (!membership) {

        alert(
            "You are not in a team."
        );

        return;
    }


    const {
        error
    } = await client

        .from("team_messages")

        .insert({

            team_id:
                membership.team_id,

            player_id:
                user.id,

            message:
                text

        });


    if (error) {

        console.error(error);

        alert(
            "Message could not be sent."
        );

        return;
    }


    input.value = "";


    await loadTeamMessages(
        membership.team_id,
        user.id
    );

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================
   SEND BUTTON
========================================= */

const sendButton =
    document.getElementById(
        "sendTeamMessage"
    );


if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendTeamMessage
    );

}


/* ENTER TO SEND */

const chatInput =
    document.getElementById(
        "teamChatInput"
    );


if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendTeamMessage();

            }

        }
    );

}


/* =========================================
   START
========================================= */

loadMyTeam();
