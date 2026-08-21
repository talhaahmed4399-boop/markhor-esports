/* =========================================
   MARKHOR ESPORTS
   MY TEAM SYSTEM
========================================= */


/* =========================================
   SUPABASE
========================================= */

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


/* CHAT */

const chatMessages =
    document.getElementById("teamChatMessages");

const chatInput =
    document.getElementById("teamChatInput");

const sendButton =
    document.getElementById("sendTeamMessage");


/* REQUESTS */

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


/* LEAVE */

const leaveTeamBtn =
    document.getElementById("leaveTeamBtn");

const leavePopup =
    document.getElementById("leavePopup");

const cancelLeave =
    document.getElementById("cancelLeave");

const confirmLeave =
    document.getElementById("confirmLeave");


/* DISBAND */

const disbandTeamBtn =
    document.getElementById("disbandTeamBtn");

const disbandPopup =
    document.getElementById("disbandPopup");

const cancelDisband =
    document.getElementById("cancelDisband");

const confirmDisband =
    document.getElementById("confirmDisband");


/* =========================================
   VARIABLES
========================================= */

let currentUser = null;

let currentTeamId = null;

let currentRole = null;

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

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value || "";

    return div.innerHTML;

}


/* =========================================
   LOAD MY TEAM
========================================= */

async function loadMyTeam() {

    try {

        if (pageMessage) {

            pageMessage.style.display =
                "block";

            pageMessage.textContent =
                "Loading your team...";

        }


        /* GET USER */

        const {
            data: userData,
            error: userError
        } = await client.auth.getUser();


        if (
            userError ||
            !userData ||
            !userData.user
        ) {

            if (pageMessage) {

                pageMessage.textContent =
                    "Please login to view your team.";

            }

            return;

        }


        currentUser =
            userData.user;


        console.log(
            "Current user:",
            currentUser.id
        );


        /* FIND MEMBERSHIP */

        const {
            data: membership,
            error: membershipError
        } = await client
            .from("team_members")
            .select(
                "team_id, player_id, role"
            )
            .eq(
                "player_id",
                currentUser.id
            )
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


        /* NO TEAM */

        if (!membership) {

            if (pageMessage) {

                pageMessage.textContent =
                    "You are not a member of any team.";

            }

            if (teamContainer) {

                teamContainer.style.display =
                    "none";

            }

            return;

        }


        currentTeamId =
            membership.team_id;

        currentRole =
            membership.role;


        console.log(
            "Team ID:",
            currentTeamId
        );

        console.log(
            "Role:",
            currentRole
        );


        /* =====================================
           CAPTAIN / PLAYER BUTTONS
        ===================================== */

        if (
            currentRole === "captain"
        ) {

            if (leaveTeamBtn) {

                leaveTeamBtn.style.display =
                    "none";

            }


            if (disbandTeamBtn) {

                disbandTeamBtn.style.display =
                    "block";

            }

        } else {

            if (leaveTeamBtn) {

                leaveTeamBtn.style.display =
                    "block";

            }


            if (disbandTeamBtn) {

                disbandTeamBtn.style.display =
                    "none";

            }

        }


        /* LOAD TEAM */

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
                "Team loading error:",
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


        /* SHOW TEAM */

        if (pageMessage) {

            pageMessage.style.display =
                "none";

        }


        if (teamContainer) {

            teamContainer.style.display =
                "block";

        }


        /* =====================================
           TEAM INFORMATION
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
            team.igl_name
        );

        setText(
            "myTeamWhatsapp",
            team.whatsapp
        );


        /* LOGO */

        const teamLogo =
            document.getElementById(
                "myTeamLogo"
            );


        if (
            teamLogo &&
            team.logo_url
        ) {

            teamLogo.innerHTML = `
                <img
                    src="${escapeHtml(team.logo_url)}"
                    alt="${escapeHtml(team.name)}"
                >
            `;

        }


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
                ? "PUBG UID: " +
                  team.player1_uid
                : "PUBG UID: -"
        );


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


        /* SUBSTITUTES */

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
           TEAM CHAT
        ===================================== */

        await loadMessages();

        startRealtime();


        /* =====================================
           JOIN REQUESTS
        ===================================== */

        await loadRequestCount();

        startRequestRealtime();


    } catch (error) {

        console.error(
            "MY TEAM ERROR:",
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

    if (!currentTeamId)
        return;


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

    if (!currentTeamId)
        return;


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
            "Request loading error:",
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

        requestsList.innerHTML =
            "";

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


            card.innerHTML = `

                <div class="team-request-profile">

                    <div class="team-request-avatar">

                        ${
                            profile.avatarurl
                            ?
                            `<img
                                src="${escapeHtml(profile.avatarurl)}"
                                alt="Avatar"
                            >`
                            :
                            `<span>
                                ${escapeHtml(
                                    (
                                        profile.username ||
                                        "P"
                                    )
                                    .charAt(0)
                                    .toUpperCase()
                                )}
                            </span>`
                        }

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
                        type="button"
                        class="view-request-profile"
                        data-player-id="${escapeHtml(
                            request.player_id
                        )}"
                    >
                        VIEW PROFILE
                    </button>


                    <button
                        type="button"
                        class="accept-request"
                        data-request-id="${escapeHtml(
                            request.id
                        )}"
                    >
                        ACCEPT
                    </button>


                    <button
                        type="button"
                        class="reject-request"
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
   ACCEPT / REJECT
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
        .maybeSingle();


    if (
        requestError ||
        !request
    ) {

        console.error(
            "Request error:",
            requestError
        );

        alert(
            "Request not found."
        );

        return;

    }


    /* ACCEPT */

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
                "Add member error:",
                memberError
            );


            alert(
                "Player could not be added."
            );

            return;

        }

    }


    /* UPDATE REQUEST */

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


    alert(
        status === "accepted"
            ? "Player joined your team."
            : "Request rejected."
    );

}


/* =========================================
   REQUEST PANEL
========================================= */

if (requestsButton) {

    requestsButton.addEventListener(
        "click",
        async () => {

            if (!requestsPanel)
                return;


            const isHidden =
                requestsPanel.style.display ===
                "none" ||
                requestsPanel.style.display ===
                "";


            if (isHidden) {

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

    if (!currentTeamId)
        return;


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
            .subscribe();

}


/* =========================================
   CHAT
========================================= */

async function loadMessages() {

    if (!currentTeamId)
        return;


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
            "Chat error:",
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

    if (!chatMessages)
        return;


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


    chatMessages.innerHTML =
        "";


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

    if (!chatMessages)
        return;


    const empty =
        chatMessages.querySelector(
            ".chat-empty"
        );


    if (empty)
        empty.remove();


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "team-chat-message";


    const sender =
        message.player_id ===
        currentUser?.id
            ? "YOU"
            : "TEAM MEMBER";


    element.innerHTML = `

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
        element
    );


    if (scroll)
        scrollChat();

}


/* =========================================
   SCROLL CHAT
========================================= */

function scrollChat() {

    if (!chatMessages)
        return;


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
            "Team information is not loaded."
        );

        return;

    }


    const message =
        chatInput
            ? chatInput.value.trim()
            : "";


    if (!message)
        return;


    if (sendButton)
        sendButton.disabled = true;


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
                message

        });


    if (sendButton)
        sendButton.disabled = false;


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


    if (chatInput)
        chatInput.value = "";

}


/* =========================================
   CHAT REALTIME
========================================= */

function startRealtime() {

    if (!currentTeamId)
        return;


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
            .subscribe();

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
   LEAVE POPUP
========================================= */

if (leaveTeamBtn) {

    leaveTeamBtn.addEventListener(
        "click",
        () => {

            if (leavePopup) {

                leavePopup.style.display =
                    "flex";

            }

        }
    );

}


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
   LEAVE TEAM
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


    if (
        currentRole ===
        "captain"
    ) {

        alert(
            "Captain cannot leave the team. Please disband the team."
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


        if (leaveTeamBtn) {

            leaveTeamBtn.disabled =
                false;

            leaveTeamBtn.textContent =
                "LEAVE TEAM";

        }

        return;

    }


    alert(
        "You have left the team."
    );


    window.location.href =
        "team.html";

}


/* =========================================
   DISBAND POPUP
========================================= */

if (disbandTeamBtn) {

    disbandTeamBtn.addEventListener(
        "click",
        () => {

            if (
                currentRole !==
                "captain"
            ) {

                return;

            }


            if (disbandPopup) {

                disbandPopup.style.display =
                    "flex";

            }

        }
    );

}


if (cancelDisband) {

    cancelDisband.addEventListener(
        "click",
        () => {

            if (disbandPopup) {

                disbandPopup.style.display =
                    "none";

            }

        }
    );

}


if (confirmDisband) {

    confirmDisband.addEventListener(
        "click",
        async () => {

            if (disbandPopup) {

                disbandPopup.style.display =
                    "none";

            }


            await disbandTeam();

        }
    );

}


/* =========================================
   DISBAND TEAM
========================================= */

async function disbandTeam() {

    if (
        !currentUser ||
        !currentTeamId
    ) {

        alert(
            "Team information is not loaded."
        );

        return;

    }


    if (
        currentRole !==
        "captain"
    ) {

        alert(
            "Only the captain can disband the team."
        );

        return;

    }


    if (disbandTeamBtn) {

        disbandTeamBtn.disabled =
            true;

        disbandTeamBtn.textContent =
            "DISBANDING...";

    }


    /* DELETE MESSAGES */

    const {
        error: chatError
    } = await client
        .from("team_messages")
        .delete()
        .eq(
            "team_id",
            currentTeamId
        );


    if (chatError) {

        console.error(
            "Chat delete error:",
            chatError
        );

    }


    /* DELETE JOIN REQUESTS */

    const {
        error: requestError
    } = await client
        .from("team_join_requests")
        .delete()
        .eq(
            "team_id",
            currentTeamId
        );


    if (requestError) {

        console.error(
            "Request delete error:",
            requestError
        );

    }


    /* DELETE MEMBERS */

    const {
        error: memberError
    } = await client
        .from("team_members")
        .delete()
        .eq(
            "team_id",
            currentTeamId
        );


    if (memberError) {

        console.error(
            "Member delete error:",
            memberError
        );


        alert(
            "Team members could not be removed."
        );


        if (disbandTeamBtn) {

            disbandTeamBtn.disabled =
                false;

            disbandTeamBtn.textContent =
                "DISBAND TEAM";

        }

        return;

    }


    /* DELETE TEAM */

    const {
        error: teamError
    } = await client
        .from("teams")
        .delete()
        .eq(
            "id",
            currentTeamId
        )
        .eq(
            "captain_id",
            currentUser.id
        );


    if (teamError) {

        console.error(
            "Team delete error:",
            teamError
        );


        alert(
            "Team could not be disbanded."
        );


        if (disbandTeamBtn) {

            disbandTeamBtn.disabled =
                false;

            disbandTeamBtn.textContent =
                "DISBAND TEAM";

        }

        return;

    }


    alert(
        "Your team has been disbanded."
    );


    window.location.href =
        "team.html";

}


/* =========================================
   START
========================================= */

loadMyTeam();
