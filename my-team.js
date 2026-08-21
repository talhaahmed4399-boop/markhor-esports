const client = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);


/* =========================================
   ELEMENTS
========================================= */

const pageMessage =
    document.getElementById("teamPageMessage");

const teamContainer =
    document.getElementById("myTeamContainer");

const chatMessages =
    document.getElementById("teamChatMessages");

const chatInput =
    document.getElementById("teamChatInput");

const sendButton =
    document.getElementById("sendTeamMessage");


let currentUser = null;
let currentTeamId = null;
let chatChannel = null;


/* =========================================
   HELPER
========================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value ?? "-";
    }

}


/* =========================================
   ESCAPE MESSAGE
========================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


/* =========================================
   LOAD TEAM
========================================= */

async function loadMyTeam() {

    try {

        pageMessage.textContent =
            "Loading your team...";


        const {
            data: userData,
            error: userError
        } = await client.auth.getUser();


        if (userError || !userData.user) {

            pageMessage.textContent =
                "Please login to view your team.";

            return;

        }


        currentUser =
            userData.user;


        /* =====================================
           FIND TEAM MEMBERSHIP
        ===================================== */

        const {
            data: membership,
            error: membershipError
        } = await client
            .from("team_members")
            .select("team_id")
            .eq("player_id", currentUser.id)
            .limit(1)
            .maybeSingle();


        if (membershipError) {

            console.error(
                "Membership error:",
                membershipError
            );

            pageMessage.textContent =
                "Unable to load team membership.";

            return;

        }


        if (!membership) {

            pageMessage.textContent =
                "You are not a member of any team.";

            return;

        }


        currentTeamId =
            membership.team_id;


        /* =====================================
           LOAD TEAM
        ===================================== */

        const {
            data: team,
            error: teamError
        } = await client
            .from("teams")
            .select("*")
            .eq("id", currentTeamId)
            .maybeSingle();


        if (teamError) {

            console.error(
                "Team error:",
                teamError
            );

            pageMessage.textContent =
                "Unable to load team.";

            return;

        }


        if (!team) {

            pageMessage.textContent =
                "Team not found.";

            return;

        }


        /* =====================================
           SHOW TEAM PAGE
        ===================================== */

        pageMessage.style.display =
            "none";

        teamContainer.style.display =
            "block";


        /* =====================================
           BASIC TEAM DATA
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

            logo.innerHTML = `
                <img
                    src="${escapeHtml(team.team_logo)}"
                    alt="Team Logo"
                >
            `;

        }


        /* =====================================
           TEAM STATS
        ===================================== */

        setText(
            "teamRank",
            team.rank
                ? "#" + team.rank
                : "#--"
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
           LOAD CHAT
        ===================================== */

        await loadMessages();


        /* =====================================
           START REALTIME
        ===================================== */

        startRealtime();


    } catch (error) {

        console.error(error);

        pageMessage.textContent =
            "Something went wrong while loading your team.";

    }

}


/* =========================================
   LOAD CHAT MESSAGES
========================================= */

async function loadMessages() {

    if (!currentTeamId) return;


    const {
        data: messages,
        error
    } = await client
        .from("team_messages")
        .select("*")
        .eq("team_id", currentTeamId)
        .order("created_at", {
            ascending: true
        });


    if (error) {

        console.error(
            "Chat load error:",
            error
        );

        return;

    }


    renderMessages(messages || []);

}


/* =========================================
   RENDER CHAT
========================================= */

function renderMessages(messages) {

    if (!chatMessages) return;


    if (!messages.length) {

        chatMessages.innerHTML = `
            <div class="chat-empty">

                <div class="chat-empty-icon">
                    💬
                </div>

                <strong>
                    TEAM CHAT
                </strong>

                <p>
                    Your team messages will appear here.
                </p>

            </div>
        `;

        return;

    }


    chatMessages.innerHTML = "";


    messages.forEach(
        message => {

            addMessageToChat(
                message,
                false
            );

        }
    );


    scrollChat();

}


/* =========================================
   ADD MESSAGE
========================================= */

function addMessageToChat(
    message,
    scroll = true
) {

    if (!chatMessages) return;


    const empty =
        chatMessages.querySelector(
            ".chat-empty"
        );


    if (empty) {
        empty.remove();
    }


    const messageElement =
        document.createElement("div");


    messageElement.className =
        "team-chat-message";


    const sender =
        message.player_id === currentUser?.id
            ? "YOU"
            : "TEAM MEMBER";


    messageElement.innerHTML = `

        <strong>
            ${sender}
        </strong>

        <p>
            ${escapeHtml(message.message)}
        </p>

    `;


    chatMessages.appendChild(
        messageElement
    );


    if (scroll) {
        scrollChat();
    }

}


/* =========================================
   SCROLL CHAT
========================================= */

function scrollChat() {

    if (!chatMessages) return;

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* =========================================
   SEND MESSAGE
========================================= */

async function sendTeamMessage() {

    if (!currentUser || !currentTeamId) {

        alert(
            "Your team is still loading."
        );

        return;

    }


    const text =
        chatInput.value.trim();


    if (!text) return;


    sendButton.disabled =
        true;


    const {
        error
    } = await client
        .from("team_messages")
        .insert({

            team_id:
                currentTeamId,

            player_id:
                currentUser.id,

            message:
                text

        });


    sendButton.disabled =
        false;


    if (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "Message could not be sent."
        );

        return;

    }


    chatInput.value = "";

}


/* =========================================
   REALTIME
========================================= */

function startRealtime() {

    if (!currentTeamId) return;


    if (chatChannel) {

        client.removeChannel(
            chatChannel
        );

    }


    chatChannel =
        client
            .channel(
                "team-chat-" +
                currentTeamId
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "team_messages",
                    filter:
                        "team_id=eq." +
                        currentTeamId
                },
                payload => {

                    addMessageToChat(
                        payload.new,
                        true
                    );

                }
            )
            .subscribe(
                status => {

                    console.log(
                        "Team chat:",
                        status
                    );

                }
            );

}


/* =========================================
   SEND BUTTON
========================================= */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendTeamMessage
    );

}


/* =========================================
   ENTER KEY
========================================= */

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        event => {

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
