```javascript
// =========================================
// MARKHOR ESPORTS ADMIN PANEL
// =========================================

console.log("MARKHOR ADMIN PANEL STARTED");


// =========================================
// SUPABASE
// =========================================

const adminClient = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);


// =========================================
// CONSTANTS
// =========================================

const ADMIN_ID =
    "ce3f31c6-333f-442a-8416-778007d341db";

const TOURNAMENT_ID =
    "12315134-ab7a-4705-baf6-92897fa09b50";


// =========================================
// HELPERS
// =========================================

function $(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
}


// =========================================
// ADMIN ACCESS
// =========================================

async function checkAdmin() {

    console.log("CHECKING ADMIN...");

    const {
        data: { user },
        error
    } = await adminClient.auth.getUser();

    if (error) {
        console.error("AUTH ERROR:", error);
        showAccessDenied("AUTHENTICATION ERROR");
        return;
    }

    if (!user) {
        showAccessDenied("PLEASE LOGIN FIRST");
        return;
    }

    console.log("CURRENT USER:", user.id);

    if (user.id !== ADMIN_ID) {
        showAccessDenied("ADMIN ACCESS DENIED");
        return;
    }

    if ($("adminLoading")) {
        $("adminLoading").style.display = "none";
    }

    if ($("adminPanel")) {
        $("adminPanel").style.display = "block";
    }

    await loadDashboard();

    await loadScoreTeams();

    await loadAdminAnnouncements();
}


function showAccessDenied(message) {

    const loading = document.getElementById("adminLoading");

    if (!loading) {
        return;
    }

    loading.innerHTML =
        "<div>" +
        "<h2>" + message + "</h2>" +
        "<p>You do not have permission to access this page.</p>" +
        '<a href="index.html" class="lime">BACK TO WEBSITE</a>' +
        "</div>";
}


// =========================================
// DASHBOARD
// =========================================

async function loadDashboard() {

    await loadTournaments();

    await loadRegistrations();
}


// =========================================
// TOURNAMENTS
// =========================================

async function loadTournaments() {

    const box = $("adminTournaments");

    if (!box) return;

    const {
        data,
        error
    } = await adminClient
        .from("tournaments")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    console.log("ADMIN TOURNAMENTS:", data);

    if (error) {

        console.error(
            "TOURNAMENT ERROR:",
            error
        );

        box.innerHTML =
            "TOURNAMENT LOAD ERROR";

        return;
    }

    setText(
        "totalTournaments",
        data.length
    );

    if (!data.length) {

        box.innerHTML =
            "NO TOURNAMENTS FOUND";

        return;
    }

    let html = "";

    data.forEach(tournament => {

        const status =
            tournament.status ||
            tournament.tournament_status ||
            "upcoming";

        html +=
    '<div class="admin-tournament">' +

        '<div>' +

            '<small>' +
                String(status).toUpperCase() +
            '</small>' +

            '<h3>' +
                (tournament.name || "UNTITLED TOURNAMENT") +
            '</h3>' +

        '</div>' +

        '<div class="admin-tournament-meta">' +

            '<span>' +
                'PRIZE ' +
                '<strong>₨' +
                    (tournament.prize_pool || 0) +
                '</strong>' +
            '</span>' +

            '<span>' +
                'TEAMS ' +
                '<strong>' +
                    (tournament.max_teams || 0) +
                '</strong>' +
            '</span>' +

        '</div>' +

    '</div>';
    
    });

    box.innerHTML = html;


    const tournament =
        data.find(
            item => item.id === TOURNAMENT_ID
        );

    if (!tournament) {

        console.error(
            "MARKHOR BATTLEFIELD NOT FOUND"
        );

        return;
    }


    if ($("tournamentControls")) {
        $("tournamentControls").style.display =
            "grid";
    }


    if ($("maxTeamsInput")) {
        $("maxTeamsInput").value =
            tournament.max_teams || 0;
    }


    if ($("prizePoolInput")) {
        $("prizePoolInput").value =
            tournament.prize_pool || 0;
    }


    if ($("tournamentStatusInput")) {
        $("tournamentStatusInput").value =
            tournament.status ||
            tournament.tournament_status ||
            "upcoming";
    }


    updateRegistrationButton(
        tournament.registration_status
    );


    setText(
        "totalSlots",
        tournament.max_teams || 0
    );
}


// =========================================
// REGISTERED TEAMS
// =========================================

async function loadRegistrations() {

    const box = $("adminTeams");

    if (!box) return;

    const {
        data,
        error
    } = await adminClient
        .from("tournament_registrations")
        .select(`
            id,
            tournament_id,
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
        "ADMIN REGISTRATIONS:",
        data
    );

    console.log(
        "ADMIN TEAMS ERROR:",
        error
    );

    if (error) {

        box.innerHTML =
            "REGISTRATION LOAD ERROR";

        return;
    }

    setText(
        "totalRegistrations",
        data.length
    );

    setText(
        "adminTeamCount",
        data.length
    );


    if (!data.length) {

        box.innerHTML =
            "NO REGISTERED TEAMS";

        loadGroups([]);

        return;
    }


    let html = "";


    data.forEach(
        (registration, index) => {

            const team =
                registration.teams;

            if (!team) return;


            const teamName =
                team.name ||
                "UNKNOWN TEAM";

            const teamTag =
                team.tag ||
                "TEAM";

            const group =
                registration.group_name ||
                "NOT ASSIGNED";

            const status =
                registration.status ||
                "registered";


            let statusClass =
                "registered";

            if (status === "approved") {
                statusClass = "approved";
            }

            if (status === "rejected") {
                statusClass = "rejected";
            }


            const logo =
                team.logo_url
                    ? `
                        <img
                            src="${team.logo_url}"
                            alt="${teamName}"
                            class="admin-team-logo"
                        >
                    
                
                        <div class="admin-team-logo-placeholder">
                            ${teamName
                                .charAt(0)
                                .toUpperCase()}
                        </div>
            


            const date =
                registration.created_at
                    ? new Date(
                        registration.created_at
                    ).toLocaleDateString()
                    : "-";


            html += `
                <div class="admin-team-card">

                    <div class="admin-team-number">
                        ${String(index + 1).padStart(2, "0")}
                    </div>

                    ${logo}

                    <div class="admin-team-info">

                        <h3>
                            ${teamName}
                        </h3>

                        <small>
                            TAG: ${teamTag}
                        </small>

                        <span>
                            GROUP: ${group}
                        </span>

                        <span>
                            REGISTERED: ${date}
                        </span>

                    </div>

                    <div class="admin-team-actions">

                        <span
                            class="
                                admin-registration-status
                                ${statusClass}
                            "
                        >
                            ${String(status).toUpperCase()}
                        </span>

                        <button
                            type="button"
                            class="admin-approve-btn"
                            onclick="updateRegistrationStatus(
                                '${registration.id}',
                                'approved'
                            )"
                        >
                            APPROVE
                        </button>

                        <button
                            type="button"
                            class="admin-reject-btn"
                            onclick="updateRegistrationStatus(
                                '${registration.id}',
                                'rejected'
                            )"
                        >
                            REJECT
                        </button>

                    </div>

                </div>
            `;
        }
    );


    box.innerHTML = html;

    loadGroups(data);
}


// =========================================
// APPROVE / REJECT
// =========================================

async function updateRegistrationStatus(
    registrationId,
    newStatus
) {

    console.log(
        "UPDATING REGISTRATION:",
        registrationId,
        newStatus
    );


    const {
        error
    } = await adminClient
        .from("tournament_registrations")
        .update({
            status: newStatus
        })
        .eq(
            "id",
            registrationId
        );


    if (error) {

        console.error(
            "STATUS UPDATE ERROR:",
            error
        );

        alert(
            "Unable to update registration."
        );

        return;
    }


    console.log(
        "REGISTRATION STATUS UPDATED:",
        newStatus
    );


    await loadRegistrations();
}


// =========================================
// GROUPS
// =========================================

function loadGroups(registrations) {

    const box = $("adminGroups");

    if (!box) return;


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


    registrations.forEach(
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


    let html = "";


    Object.keys(groups).forEach(
        groupName => {

            const teams =
                groups[groupName];

            if (!teams.length) return;


            html += `
                <div class="admin-group">

                    <div class="admin-group-header">

                        <strong>
                            ${groupName}
                        </strong>

                        <span>
                            ${teams.length} / 16
                        </span>

                    </div>

                    <div class="admin-group-teams">
            `;


            teams.forEach(
                registration => {

                    const team =
                        registration.teams;

                    if (!team) return;


                    html += `
                        <div>

                            <strong>
                                ${team.name}
                            </strong>

                            <small>
                                ${team.tag || ""}
                            </small>

                        </div>
                    `;
                }
            );


            html += `
                    </div>
                </div>
            `;
        }
    );


    box.innerHTML =
        html ||
        "NO GROUPS CREATED YET";
}


// =========================================
// REGISTRATION OPEN / CLOSED
// =========================================

function updateRegistrationButton(status) {

    const button =
        $("registrationToggle");

    if (!button) return;


    if (
        String(status)
            .toLowerCase() ===
        "open"
    ) {

        button.textContent =
            "REGISTRATION OPEN ✓";

        button.className =
            "lime";

    } else {

        button.textContent =
            "REGISTRATION CLOSED";

        button.className =
            "outline";
    }
}


const registrationToggle =
    $("registrationToggle");


if (registrationToggle) {

    registrationToggle.addEventListener(
        "click",
        async function() {

            const isOpen =
                this.textContent
                    .toUpperCase()
                    .includes("OPEN");

            const newStatus =
                isOpen
                    ? "closed"
                    : "open";


            this.disabled =
                true;


            const {
                error
            } = await adminClient
                .from("tournaments")
                .update({
                    registration_status:
                        newStatus
                })
                .eq(
                    "id",
                    TOURNAMENT_ID
                );


            this.disabled =
                false;


            if (error) {

                console.error(
                    "REGISTRATION STATUS ERROR:",
                    error
                );

                alert(
                    "Unable to update registration."
                );

                return;
            }


            updateRegistrationButton(
                newStatus
            );

        }
    );
}


// =========================================
// SAVE TOURNAMENT
// =========================================

const saveTournamentChanges =
    $("saveTournamentChanges");


if (saveTournamentChanges) {

    saveTournamentChanges.addEventListener(
        "click",
        async function() {

            const maxTeams =
                Number(
                    $("maxTeamsInput").value
                );


            const prizePool =
                Number(
                    $("prizePoolInput").value
                );


            const status =
                $("tournamentStatusInput").value;


            const message =
                $("tournamentSaveMessage");


            if (
                maxTeams < 1 ||
                maxTeams > 256
            ) {

                alert(
                    "Max teams must be between 1 and 256."
                );

                return;
            }


            message.textContent =
                "SAVING...";


            const {
                error
            } = await adminClient
                .from("tournaments")
                .update({

                    max_teams:
                        maxTeams,

                    prize_pool:
                        prizePool,

                    status:
                        status

                })
                .eq(
                    "id",
                    TOURNAMENT_ID
                );


            if (error) {

                console.error(
                    "TOURNAMENT SAVE ERROR:",
                    error
                );

                message.textContent =
                    "SAVE FAILED";

                return;
            }


            message.textContent =
                "CHANGES SAVED ✓";


            await loadTournaments();
        }
    );
}


// =========================================
// SCORE ENTRY
// =========================================

let adminRegisteredTeams = [];


async function loadScoreTeams() {

    const select =
        $("scoreTeamSelect");

    if (!select) return;


    const {
        data,
        error
    } = await adminClient
        .from("tournament_registrations")
        .select(`
            team_id,
            teams (
                id,
                name,
                tag
            )
        `)
        .eq(
            "tournament_id",
            TOURNAMENT_ID
        )
        .neq(
            "status",
            "rejected"
        );


    console.log(
        "SCORE TEAMS:",
        data
    );


    if (error) {

        console.error(
            "SCORE TEAM ERROR:",
            error
        );

        return;
    }


    adminRegisteredTeams =
        data || [];


    select.innerHTML = `
        <option value="">
            SELECT TEAM
        </option>
    `;


    adminRegisteredTeams.forEach(
        registration => {

            if (!registration.teams) {
                return;
            }


            const team =
                registration.teams;


            select.innerHTML += `
                <option value="${registration.team_id}">
                    ${team.name}
                    ${
                        team.tag
                            ? " [" + team.tag + "]"
                            : ""
                    }
                </option>
            `;
        }
    );
}


// =========================================
// SCORE TOTAL
// =========================================

function calculateScoreTotal() {

    const wins =
        Number(
            $("scoreWins")?.value || 0
        );


    const placement =
        Number(
            $("scorePlacement")?.value || 0
        );


    const kills =
        Number(
            $("scoreKills")?.value || 0
        );


    const total =
        wins +
        placement +
        kills;


    const preview =
        $("scoreTotalPreview");


    if (preview) {
        preview.textContent =
            total;
    }


    return total;
}


[
    "scoreWins",
    "scorePlacement",
    "scoreKills"
].forEach(
    id => {

        const input =
            $(id);

        if (input) {

            input.addEventListener(
                "input",
                calculateScoreTotal
            );
        }
    }
);


// =========================================
// SAVE SCORE
// =========================================

const saveTeamScore =
    $("saveTeamScore");


if (saveTeamScore) {

    saveTeamScore.addEventListener(
        "click",
        async function() {

            const teamId =
                $("scoreTeamSelect").value;


            const matches =
                Number(
                    $("scoreMatches").value || 0
                );


            const wins =
                Number(
                    $("scoreWins").value || 0
                );


            const placement =
                Number(
                    $("scorePlacement").value || 0
                );


            const kills =
                Number(
                    $("scoreKills").value || 0
                );


            const total =
                wins +
                placement +
                kills;


            const message =
                $("scoreSaveMessage");


            if (!teamId) {

                message.textContent =
                    "PLEASE SELECT A TEAM";

                return;
            }


            saveTeamScore.disabled =
                true;


            message.textContent =
                "SAVING SCORE...";


            const {
                error
            } = await adminClient
                .from("tournament_scores")
                .upsert({

                    tournament_id:
                        TOURNAMENT_ID,

                    team_id:
                        teamId,

                    matches_played:
                        matches,

                    wins:
                        wins,

                    placement_points:
                        placement,

                    kill_points:
                        kills,

                    total_points:
                        total,

                    updated_at:
                        new Date().toISOString()

                }, {

                    onConflict:
                        "tournament_id,team_id"

                });


            saveTeamScore.disabled =
                false;


            if (error) {

                console.error(
                    "SCORE SAVE ERROR:",
                    error
                );

                message.textContent =
                    "SCORE SAVE FAILED";

                return;
            }


            message.textContent =
                "SCORE SAVED ✓";


            await loadScoreTeams();
        }
    );
}


// =========================================
// ANNOUNCEMENTS
// =========================================

async function loadAdminAnnouncements() {

    const container =
        $("adminAnnouncements");

    if (!container) return;


    const {
        data,
        error
    } = await adminClient
        .from("announcements")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    console.log(
        "ADMIN ANNOUNCEMENTS:",
        data
    );


    if (error) {

        console.error(
            "ANNOUNCEMENT LOAD ERROR:",
            error
        );

        container.innerHTML =
            "UNABLE TO LOAD ANNOUNCEMENTS";

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML =
            "NO ANNOUNCEMENTS YET";

        return;
    }


    container.innerHTML = "";


    data.forEach(
        announcement => {

            const status =
                announcement.published
                    ? "PUBLISHED"
                    : "DRAFT";


            container.innerHTML += `
                <div class="admin-announcement-card">

                    <div>

                        <small>
                            ANNOUNCEMENT
                        </small>

                        <h3>
                            ${announcement.title}
                        </h3>

                        <p>
                            ${announcement.content}
                        </p>

                        <span>
                            ${status}
                        </span>

                    </div>


                    <button
                        class="outline"
                        type="button"
                        onclick="deleteAnnouncement(
                            '${announcement.id}'
                        )"
                    >
                        DELETE
                    </button>

                </div>
            `;
        }
    );
}


// =========================================
// CREATE ANNOUNCEMENT
// =========================================

const publishAnnouncement =
    $("publishAnnouncement");


if (publishAnnouncement) {

    publishAnnouncement.addEventListener(
        "click",
        async function() {

            const title =
                $("announcementTitle")
                    .value
                    .trim();


            const content =
                $("announcementMessage")
                    .value
                    .trim();


            const published =
                $("announcementPublished")
                    .value === "true";


            const status =
                $("announcementMessageStatus");


            if (!title) {

                status.textContent =
                    "PLEASE ENTER A TITLE";

                return;
            }


            if (!content) {

                status.textContent =
                    "PLEASE ENTER A MESSAGE";

                return;
            }


            publishAnnouncement.disabled =
                true;


            status.textContent =
                "PUBLISHING...";


            const {
                error
            } = await adminClient
                .from("announcements")
                .insert({

                    title:
                        title,

                    content:
                        content,

                    published:
                        published

                });


            publishAnnouncement.disabled =
                false;


            if (error) {

                console.error(
                    "ANNOUNCEMENT SAVE ERROR:",
                    error
                );

                status.textContent =
                    "FAILED TO PUBLISH ANNOUNCEMENT";

                return;
            }


            status.textContent =
                "ANNOUNCEMENT PUBLISHED ✓";


            $("announcementTitle").value =
                "";

            $("announcementMessage").value =
                "";

            $("announcementPublished").value =
                "true";


            await loadAdminAnnouncements();
        }
    );
}


// =========================================
// DELETE ANNOUNCEMENT
// =========================================

async function deleteAnnouncement(id) {

    const confirmed =
        confirm(
            "Delete this announcement?"
        );


    if (!confirmed) return;


    const {
        error
    } = await adminClient
        .from("announcements")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "ANNOUNCEMENT DELETE ERROR:",
            error
        );

        alert(
            "FAILED TO DELETE ANNOUNCEMENT"
        );

        return;
    }


    await loadAdminAnnouncements();
}


// =========================================
// LOGOUT
// =========================================

const logoutBtn =
    $("adminLogout");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            await adminClient.auth.signOut();

            window.location.href =
                "index.html";
        }
    );
}


// =========================================
// START
// =========================================

checkAdmin();
```
