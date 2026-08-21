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

const requestsButton =
    document.getElementById("teamRequestsButton");

const requestCount =
    document.getElementById("teamRequestCount");

const requestsPanel =
    document.getElementById("teamRequestsPanel");

const requestsList =
    document.getElementById("teamRequestsList");

const closeRequests =
    document.getElementById("closeTeamRequests");


let currentUser = null;
let currentTeamId = null;

let chatChannel = null;
let requestChannel = null;


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
   ESCAPE HTML
========================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


/* =========================================
   LOAD MY TEAM
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
           PLAYERS
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
           SUBSTITUTES
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
           LOAD REQUEST COUNT
        ===================================== */

        await loadRequestCount();


        /* =====================================
           START REALTIME
        ===================================== */

        startRealtime();

        startRequestRealtime();


    } catch (error) {

        console.error(error);

        pageMessage.textContent =
            "Something went wrong while loading your team.";

    }

}


/* =========================================
   LOAD REQUEST COUNT
========================================= */

async function loadRequestCount() {

    if (!currentTeamId) return;


    const {
        count,
        error
    } = await client
        .from("team_join_requests")
        .select(
            "*",
            {
                count: "exact",
                head: true
            }
        )
        .eq("team_id", currentTeamId)
        .eq("status", "pending");


    if (error) {

        console.error(
            "Request count error:",
            error
        );

        return;

    }


    if (requestCount) {

        requestCount.textContent =
            count || 0;

        requestCount.style.display =
            count > 0
                ? "flex"
                : "none";

    }

}


/* =========================================
   LOAD REQUESTS
========================================= */

async function loadRequests() {

    if (!currentTeamId) return;


    requestsList.innerHTML = `
        <div class="requests-loading">
            Loading requests...
        </div>
    `;


   const {
    data: requests,
    error
} = await client
    .from("team_join_requests")
    .select(`
    id,
    player_id,
    status,
    created_at,
    profiles (
        username,
        full_name,
        pubguid,
        country,
        avatarurl
    )
`)
    .eq("team_id", currentTeamId)
    .eq("status", "pending")
    .order(
        "created_at",
        {
            ascending:false
        }
    );


    if (error) {

        console.error(
            "Requests error:",
            error
        );

        requestsList.innerHTML = `
            <div class="requests-empty">
                Unable to load requests.
            </div>
        `;

        return;

    }


    if (!requests || requests.length === 0) {

        requestsList.innerHTML = `
            <div class="requests-empty">
                NO PENDING JOIN REQUESTS
            </div>
        `;

        return;

    }


    requestsList.innerHTML = "";


    requests.forEach(
        request => {

            const card =
                document.createElement("div");

            card.className =
                "team-request-card";

card.innerHTML = `

    <div class="team-request-profile">

        <div class="team-request-avatar">

            ${
                request.profiles?.avatarurl
                ? `
                    <img
                        src="${escapeHtml(request.profiles.avatarurl)}"
                        alt="Player Avatar"
                    >
                  `
                : `
                    <span>
                        ${escapeHtml(
                            (
                                request.profiles?.username ||
                                "P"
                            ).charAt(0).toUpperCase()
                        )}
                    </span>
                  `
            }

        </div>


        <div class="team-request-info">

            <strong>
                ${escapeHtml(
                    request.profiles?.username ||
                    "Unknown Player"
                )}
            </strong>

            <span>
                ${escapeHtml(
                    request.profiles?.full_name ||
                    "Full Name Not Available"
                )}
            </span>


            <div class="team-request-meta">

                <small>
                    PUBG UID:
                    ${escapeHtml(
                        request.profiles?.pubguid ||
                        "-"
                    )}
                </small>

                <small>
                    COUNTRY:
                    ${escapeHtml(
                        request.profiles?.country ||
                        "-"
                    )}
                </small>

            </div>

        </div>

    </div>


    <div class="team-request-actions">

        <button
            class="view-request-profile"
            data-player-id="${request.player_id}"
            type="button"
        >
            VIEW PROFILE
        </button>


        <button
            class="accept-request"
            data-request-id="${request.id}"
            type="button"
        >
            ACCEPT
        </button>


        <button
            class="reject-request"
            data-request-id="${request.id}"
            type="button"
        >
            REJECT
        </button>

    </div>

`;
          


            requestsList.appendChild(card);

        }
    );


    attachRequestButtons();

}


/* =========================================
   ACCEPT / REJECT BUTTONS
========================================= */

function attachRequestButtons() {

    document
        .querySelectorAll(".accept-request")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    handleRequest(
                        button.dataset.requestId,
                        "accepted"
                    );

                }
            );

        });


    document
        .querySelectorAll(".reject-request")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    handleRequest(
                        button.dataset.requestId,
                        "rejected"
                    );

                }
            );

        });

}


/* =========================================
   HANDLE REQUEST
========================================= */

async function handleRequest(
    requestId,
    status
) {


    // Request data fetch
    const {
        data: request,
        error: requestError
    } = await client
        .from("team_join_requests")
        .select("*")
        .eq("id", requestId)
        .single();


    if (requestError || !request) {

        console.error(
            "Request fetch error:",
            requestError
        );

        alert(
            "Request not found"
        );

        return;

    }



    // ACCEPT PLAYER
    if (status === "accepted") {


        const {
            error: memberError
        } = await client
            .from("team_members")
            .insert({

                team_id:
                    request.team_id,

                player_id:
                    request.player_id,

                role:
                    "player"

            });



        if (memberError) {

            console.error(
                "Member add error:",
                memberError
            );

            alert(
                "Player could not be added"
            );

            return;

        }


    }



    // UPDATE REQUEST STATUS

    const {
        error:updateError
    } = await client
        .from("team_join_requests")
        .update({

            status: status

        })
        .eq(
            "id",
            requestId
        );



    if(updateError){

        console.error(
            "Request update error:",
            updateError
        );

        alert(
            "Request update failed"
        );

        return;

    }



    // Refresh

    await loadRequests();

    await loadRequestCount();


    alert(
        status === "accepted"
        ? "Player joined your team"
        : "Request rejected"
    );


}

/* =========================================
   NOTIFICATION BUTTON
========================================= */

if (requestsButton) {

    requestsButton.addEventListener(
        "click",
        async () => {

            if (
                requestsPanel.style.display ===
                "none"
            ) {

                requestsPanel.style.display =
                    "block";

                await loadRequests();

            } else {

                requestsPanel.style.display =
                    "none";

            }

        }
    );

}


/* =========================================
   CLOSE REQUEST PANEL
========================================= */

if (closeRequests) {

    closeRequests.addEventListener(
        "click",
        () => {

            requestsPanel.style.display =
                "none";

        }
    );

}


/* =========================================
   REQUEST REALTIME
========================================= */

function startRequestRealtime() {

    if (!currentTeamId) return;


    if (requestChannel) {

        client.removeChannel(
            requestChannel
        );

    }


    requestChannel =
        client
            .channel(
                "team-requests-" +
                currentTeamId
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "team_join_requests",
                    filter:
                        "team_id=eq." +
                        currentTeamId
                },
                async () => {

                    await loadRequestCount();

                    if (
                        requestsPanel &&
                        requestsPanel.style.display !==
                        "none"
                    ) {

                        await loadRequests();

                    }

                }
            )
            .subscribe(
                status => {

                    console.log(
                        "Team requests:",
                        status
                    );

                }
            );

}


/* =========================================
   LOAD CHAT
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
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Chat load error:",
            error
        );

        return;

    }


    renderMessages(
        messages || []
    );

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
   ADD CHAT MESSAGE
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
   CHAT REALTIME
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
   ENTER TO SEND
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
/* =========================================
   LEAVE TEAM
========================================= */

const leaveTeamBtn =
    document.getElementById("leaveTeamBtn");


if (leaveTeamBtn) {

    leaveTeamBtn.addEventListener(
        "click",
        () => {

         
const confirmed = confirm(
    "Are you really want to leave your team?"
);

if (!confirmed) {
    return;
}

leaveTeam();
/* =========================================
   LEAVE TEAM FUNCTION
========================================= */

async function leaveTeam() {

    if (!currentUser || !currentTeamId) {

        alert(
            "Team information is not loaded."
        );

        return;

    }


    leaveTeamBtn.disabled =
        true;


    leaveTeamBtn.textContent =
        "LEAVING...";


    const {
        error
    } = await client
        .from("team_members")
        .delete()
        .eq(
            "team_id",
            currentTeamId
        )
        .eq(
            "player_id",
            currentUser.id
        );


    if (error) {

        console.error(
            "Leave team error:",
            error
        );


        alert(
            "Unable to leave team."
        );


        leaveTeamBtn.disabled =
            false;


        leaveTeamBtn.textContent =
            "LEAVE TEAM";


        return;

    }


    alert(
        "You have left the team."
    );


    window.location.href =
        "team.html";

}
loadMyTeam();
