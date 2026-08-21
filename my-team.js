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

const leaveTeamBtn =
    document.getElementById("leaveTeamBtn");

const leavePopup =
    document.getElementById("leavePopup");

const cancelLeave =
    document.getElementById("cancelLeave");

const confirmLeave =
    document.getElementById("confirmLeave");


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

        if (pageMessage) {

            pageMessage.textContent =
                "Loading your team...";

        }


        const {
            data: userData,
            error: userError
        } = await client.auth.getUser();


        if (userError || !userData.user) {

            if (pageMessage) {

                pageMessage.textContent =
                    "Please login to view your team.";

            }

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
    .select("team_id, player_id, role")
    .eq("player_id", currentUser.id)
    .maybeSingle();


        if (membershipError) {

            console.error(
                "Membership error:",
                membershipError
            );

            if (pageMessage) {

                pageMessage.textContent =
                    "Unable to load team membership.";

            }

            return;

        }


        if (!membership) {

            if (pageMessage) {

                pageMessage.textContent =
                    "You are not a member of any team.";

            }

            return;

        }


        currentTeamId =
            membership.team_id;

        const disbandTeamBtn =
document.getElementById("disbandTeamBtn");


if(membership.role === "captain"){

    if(leaveTeamBtn)
        leaveTeamBtn.style.display="none";


    if(disbandTeamBtn)
        disbandTeamBtn.style.display="block";

}
else{

    if(leaveTeamBtn)
        leaveTeamBtn.style.display="block";


    if(disbandTeamBtn)
        disbandTeamBtn.style.display="none";

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
            .eq(
                "id",
                currentTeamId
            )
            .maybeSingle();


        if (teamError) {

            console.error(
                "Team error:",
                teamError
            );

            if (pageMessage) {

                pageMessage.textContent =
                    "Unable to load team.";

            }

            return;

        }


        if (!team) {

            if (pageMessage) {

                pageMessage.textContent =
                    "Team not found.";

            }

            return;

        }


        /* =====================================
           SHOW TEAM PAGE
        ===================================== */

        if (pageMessage) {

            pageMessage.style.display =
                "none";

        }


        if (teamContainer) {

            teamContainer.style.display =
                "block";

        }


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
            team.igl ||
            team.captain_name
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


        if (
            logo &&
            team.team_logo
        ) {

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
                ? "PUBG UID: " +
                  team.player1_uid
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
                ? "PUBG UID: " +
                  team.player2_uid
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
                ? "PUBG UID: " +
                  team.player3_uid
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
                ? "PUBG UID: " +
                  team.player4_uid
                : "PUBG UID: -"
        );


        /* =====================================
           SUBSTITUTE 1
        ===================================== */

        setText(
            "sub1Name",
            team.sub1_name ||
            "No Substitute"
        );

        setText(
            "sub1Uid",
            team.sub1_uid
                ? "PUBG UID: " +
                  team.sub1_uid
                : "PUBG UID: -"
        );


        /* =====================================
           SUBSTITUTE 2
        ===================================== */

        setText(
            "sub2Name",
            team.sub2_name ||
            "No Substitute"
        );

        setText(
            "sub2Uid",
            team.sub2_uid
                ? "PUBG UID: " +
                  team.sub2_uid
                : "PUBG UID: -"
        );


        /* =====================================
           ROSTER COUNT
        ===================================== */

        let rosterCount = 0;

        if (team.player1_name)
            rosterCount++;

        if (team.player2_name)
            rosterCount++;

        if (team.player3_name)
            rosterCount++;

        if (team.player4_name)
            rosterCount++;


        setText(
            "myTeamRoster",
            rosterCount + " / 4"
        );


        /* =====================================
           LOAD CHAT
        ===================================== */

        await loadMessages();


        /* =====================================
           LOAD REQUESTS
        ===================================== */

        await loadRequestCount();


        /* =====================================
           START REALTIME
        ===================================== */

        startRealtime();

        startRequestRealtime();


    } catch (error) {

        console.error(
            "My Team error:",
            error
        );

        if (pageMessage) {

            pageMessage.textContent =
                "Something went wrong while loading your team.";

        }

    }

}


/* =========================================
   REQUEST COUNT
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
        .eq(
            "team_id",
            currentTeamId
        )
        .eq(
            "status",
            "pending"
        );


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


    if (requestsList) {

        requestsList.innerHTML = `
            <div class="requests-loading">
                LOADING REQUESTS...
            </div>
        `;

    }


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
        .eq(
            "team_id",
            currentTeamId
        )
        .eq(
            "status",
            "pending"
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Requests error:",
            error
        );

        if (requestsList) {

            requestsList.innerHTML = `
                <div class="requests-empty">
                    UNABLE TO LOAD REQUESTS
                </div>
            `;

        }

        return;

    }


    if (
        !requests ||
        requests.length === 0
    ) {

        if (requestsList) {

            requestsList.innerHTML = `
                <div class="requests-empty">
                    NO PENDING JOIN REQUESTS
                </div>
            `;

        }

        return;

    }


    if (requestsList) {

        requestsList.innerHTML = "";

    }


    requests.forEach(
        request => {

            const profile =
                request.profiles || {};


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "team-request-card";


            const avatar =
                profile.avatarurl
                    ? `
                        <img
                            src="${escapeHtml(profile.avatarurl)}"
                            alt="Player Avatar"
                        >
                    `
                    : `
                        <span>
                            ${escapeHtml(
                                (
                                    profile.username ||
                                    "P"
                                )
                                .charAt(0)
                                .toUpperCase()
                            )}
                        </span>
                    `;


            card.innerHTML = `

                <div class="team-request-profile">

                    <div class="team-request-avatar">

                        ${avatar}

                    </div>


                    <div class="team-request-info">

                        <strong>
                            ${escapeHtml(
                                profile.username ||
                                "Unknown Player"
                            )}
                        </strong>


                        <span>
                            ${escapeHtml(
                                profile.full_name ||
                                "Full Name Not Available"
                            )}
                        </span>


                        <div class="team-request-meta">

                            <small>
                                PUBG UID:
                                ${escapeHtml(
                                    profile.pubguid ||
                                    "-"
                                )}
                            </small>


                            <small>
                                COUNTRY:
                                ${escapeHtml(
                                    profile.country ||
                                    "-"
                                )}
                            </small>

                        </div>

                    </div>

                </div>


                <div class="team-request-actions">

                    <button
                        class="view-request-profile"
                        type="button"
                        data-player-id="${escapeHtml(
                            request.player_id
                        )}"
                    >
                        VIEW PROFILE
                    </button>


                    <button
                        class="accept-request"
                        type="button"
                        data-request-id="${escapeHtml(
                            request.id
                        )}"
                    >
                        ACCEPT
                    </button>


                    <button
                        class="reject-request"
                        type="button"
                        data-request-id="${escapeHtml(
                            request.id
                        )}"
                    >
                        REJECT
                    </button>

                </div>

            `;


            if (requestsList) {

                requestsList.appendChild(
                    card
                );

            }

        }
    );


    attachRequestButtons();

}


/* =========================================
   REQUEST BUTTONS
========================================= */

function attachRequestButtons() {

    document
        .querySelectorAll(
            ".accept-request"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        button.disabled =
                            true;

                        button.textContent =
                            "ACCEPTING...";


                        await handleRequest(
                            button.dataset.requestId,
                            "accepted"
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".reject-request"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        button.disabled =
                            true;

                        button.textContent =
                            "REJECTING...";


                        await handleRequest(
                            button.dataset.requestId,
                            "rejected"
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".view-request-profile"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const playerId =
                            button.dataset.playerId;


                        if (playerId) {

                            window.location.href =
                                "profile.html?id=" +
                                encodeURIComponent(
                                    playerId
                                );

                        }

                    }
                );

            }
        );

}


/* =========================================
   ACCEPT / REJECT REQUEST
========================================= */

async function handleRequest(
    requestId,
    status
) {

    const {
        data: request,
        error: requestError
    } = await client
        .from("team_join_requests")
        .select("*")
        .eq(
            "id",
            requestId
        )
        .eq(
            "team_id",
            currentTeamId
        )
        .single();


    if (
        requestError ||
        !request
    ) {

        console.error(
            "Request fetch error:",
            requestError
        );

        alert(
            "Request not found."
        );

        await loadRequests();

        return;

    }


    /* =====================================
       ACCEPT
    ===================================== */

    if (
        status === "accepted"
    ) {

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


            if (
                memberError.code ===
                "23505"
            ) {

                alert(
                    "This player is already in the team."
                );

            } else {

                alert(
                    "Player could not be added to the team."
                );

            }


            await loadRequests();

            return;

        }

    }


    /* =====================================
       UPDATE REQUEST
    ===================================== */

    const {
        error: updateError
    } = await client
        .from("team_join_requests")
        .update({
            status: status
        })
        .eq(
            "id",
            requestId
        )
        .eq(
            "team_id",
            currentTeamId
        );


    if (updateError) {

        console.error(
            "Request update error:",
            updateError
        );

        alert(
            "Request could not be updated."
        );

        return;

    }


    await loadRequests();

    await loadRequestCount();


    if (
        status === "accepted"
    ) {

        alert(
            "Player joined your team."
        );

    } else {

        alert(
            "Request rejected."
        );

    }

}


/* =========================================
   NOTIFICATION BUTTON
========================================= */

if (requestsButton) {

    requestsButton.addEventListener(
        "click",
        async () => {

            if (
                !requestsPanel ||
                requestsPanel.style.display ===
                "none" ||
                requestsPanel.style.display === ""
            ) {

                if (requestsPanel) {

                    requestsPanel.style.display =
                        "block";

                }


                await loadRequests();

            } else {

                requestsPanel.style.display =
                    "none";

            }

        }
    );

}


/* =========================================
   CLOSE REQUESTS
========================================= */

if (closeRequests) {

    closeRequests.addEventListener(
        "click",
        () => {

            if (requestsPanel) {

                requestsPanel.style.display =
                    "none";

            }

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
        .eq(
            "team_id",
            currentTeamId
        )
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

function renderMessages(
    messages
) {

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
        document.createElement(
            "div"
        );


    messageElement.className =
        "team-chat-message";


    const sender =
        message.player_id ===
        currentUser?.id
            ? "YOU"
            : "TEAM MEMBER";


    messageElement.innerHTML = `

        <strong>
            ${sender}
        </strong>

        <p>
            ${escapeHtml(
                message.message
            )}
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

    if (
        !currentUser ||
        !currentTeamId
    ) {

        alert(
            "Your team is still loading."
        );

        return;

    }


    const text =
        chatInput.value.trim();


    if (!text) return;


    if (sendButton) {

        sendButton.disabled =
            true;

    }


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


    if (sendButton) {

        sendButton.disabled =
            false;

    }


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


    if (chatInput) {

        chatInput.value = "";

    }

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
   LEAVE TEAM BUTTON
========================================= */

if (leaveTeamBtn) {

    leaveTeamBtn.addEventListener(
        "click",
        () => {

            if (leavePopup) {

                leavePopup.style.display =
                    "flex";

            } else {

                leaveTeam();

            }

        }
    );

}


/* =========================================
   CANCEL LEAVE
========================================= */

if (cancelLeave) {

    cancelLeave.addEventListener(
        "click",
        () => {

            if (leavePopup) {

                leavePopup.style.display =
                    "none";

            }

        }
    );

}


/* =========================================
   CONFIRM LEAVE
========================================= */

if (confirmLeave) {

    confirmLeave.addEventListener(
        "click",
        async () => {

            if (leavePopup) {

                leavePopup.style.display =
                    "none";

            }


            await leaveTeam();

        }
    );

}


/* =========================================
   LEAVE TEAM FUNCTION
========================================= */

async function leaveTeam() {

    if (
        !currentUser ||
        !currentTeamId
    ) {

        alert(
            "Team information is not loaded."
        );

        return;

    }


    if (leaveTeamBtn) {

        leaveTeamBtn.disabled =
            true;

        leaveTeamBtn.textContent =
            "LEAVING...";

    }


const {
    error
} = await client
    .from("team_members")
    .delete()
    .eq("team_id", currentTeamId)
    .eq("player_id", currentUser.id);
    


    if (error) {

        console.error(
            "Leave team error:",
            error
        );


        alert(
            "Unable to leave team."
        );


        if (leaveTeamBtn) {

            leaveTeamBtn.disabled =
                false;

            leaveTeamBtn.textContent =
                "LEAVE TEAM";

        }


        return;

    }


    window.location.href =
        "team.html";

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
   ENTER KEY CHAT
========================================= */

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
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
