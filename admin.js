// =========================================
// MARKHOR ESPORTS ADMIN PANEL
// =========================================

console.log("MARKHOR ADMIN PANEL STARTED");


// =========================================
// SUPABASE CLIENT
// =========================================

const adminClient =
    window.supabase.createClient(
        window.MARKHOR_CONFIG.supabaseUrl,
        window.MARKHOR_CONFIG.supabasePublishableKey
    );


// =========================================
// ADMIN + TOURNAMENT IDS
// =========================================

const ADMIN_ID =
    "ce3f31c6-333f-442a-8416-778007d341db";

const TOURNAMENT_ID =
    "12315134-ab7a-4705-baf6-92897fa09b50";


// =========================================
// ELEMENTS
// =========================================

const adminLoading =
    document.getElementById("adminLoading");

const adminPanel =
    document.getElementById("adminPanel");


// =========================================
// CHECK ADMIN
// =========================================

async function checkAdmin() {

    console.log("CHECKING ADMIN...");

    const {
        data: {
            user
        },
        error
    } =
        await adminClient.auth.getUser();


    if (error) {

        console.error(
            "AUTH ERROR:",
            error
        );

        showAccessDenied(
            "AUTHENTICATION ERROR"
        );

        return;
    }


    if (!user) {

        showAccessDenied(
            "PLEASE LOGIN FIRST"
        );

        return;
    }


    console.log(
        "CURRENT USER:",
        user.id
    );


    if (user.id !== ADMIN_ID) {

        showAccessDenied(
            "ADMIN ACCESS DENIED"
        );

        return;
    }


    // ADMIN VERIFIED

    adminLoading.style.display =
        "none";

    adminPanel.style.display =
        "block";


    await loadDashboard();
}


// =========================================
// ACCESS DENIED
// =========================================

function showAccessDenied(
    message = "ADMIN ACCESS DENIED"
) {

    adminLoading.innerHTML = `

        <div>

            <h2>
                ${message}
            </h2>

            <p>
                You do not have permission
                to access this page.
            </p>

            <a
                href="index.html"
                class="lime"
            >
                BACK TO WEBSITE
            </a>

        </div>

    `;
}


// =========================================
// DASHBOARD
// =========================================

async function loadDashboard() {

    await loadTournaments();

    await loadRegistrations();
}


// =========================================
// LOAD TOURNAMENTS
// =========================================

async function loadTournaments() {

    const box =
        document.getElementById(
            "adminTournaments"
        );


    const {
        data,
        error
    } =
        await adminClient
        .from("tournaments")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    console.log(
        "ADMIN TOURNAMENTS:",
        data
    );


    if (error) {

        console.error(
            "TOURNAMENT ERROR:",
            error
        );

        box.innerHTML =
            "TOURNAMENT LOAD ERROR";

        return;
    }


    document.getElementById(
        "totalTournaments"
    ).textContent =
        data.length;


    if (!data.length) {

        box.innerHTML =
            "NO TOURNAMENTS FOUND";

        return;
    }


    let html = "";


    data.forEach(
        tournament => {

            const tournamentStatus =
                tournament.status ||
                tournament.tournament_status ||
                "upcoming";


            html += `

                <div class="admin-tournament">

                    <div>

                        <small>
                            ${String(
                                tournamentStatus
                            ).toUpperCase()}
                        </small>

                        <h3>
                            ${tournament.name}
                        </h3>

                    </div>


                    <div
                        class="admin-tournament-meta"
                    >

                        <span>

                            PRIZE

                            <strong>
                                ₨${tournament.prize_pool || 0}
                            </strong>

                        </span>


                        <span>

                            TEAMS

                            <strong>
                                ${tournament.max_teams || 0}
                            </strong>

                        </span>

                    </div>

                </div>

            `;

        }
    );


    box.innerHTML =
        html;


    const battlefield =
        data.find(
            tournament =>
                tournament.id ===
                TOURNAMENT_ID
        );


    if (!battlefield) {

        console.error(
            "MARKHOR BATTLEFIELD NOT FOUND"
        );

        return;
    }


    document.getElementById(
        "tournamentControls"
    ).style.display =
        "grid";


    document.getElementById(
        "maxTeamsInput"
    ).value =
        battlefield.max_teams || 0;


    document.getElementById(
        "prizePoolInput"
    ).value =
        battlefield.prize_pool || 0;


    document.getElementById(
        "tournamentStatusInput"
    ).value =
        battlefield.status ||
        battlefield.tournament_status ||
        "upcoming";


    updateRegistrationButton(
        battlefield.registration_status
    );


    document.getElementById(
        "totalSlots"
    ).textContent =
        battlefield.max_teams || 0;
}


// =========================================
// LOAD REGISTERED TEAMS
// =========================================

async function loadRegistrations() {

    const box =
        document.getElementById(
            "adminTeams"
        );


    const {
        data,
        error
    } =
        await adminClient
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
        "ADMIN REGISTRATIONS ERROR:",
        error
    );


    if (error) {

        console.error(
            error
        );

        box.innerHTML =
            "REGISTRATION LOAD ERROR";

        return;
    }


    document.getElementById(
        "totalRegistrations"
    ).textContent =
        data.length;


    document.getElementById(
        "adminTeamCount"
    ).textContent =
        data.length;


    if (!data.length) {

        box.innerHTML =
            "NO REGISTERED TEAMS";

        loadGroups([]);

        return;
    }


    let html = "";


    data.forEach(
        (
            registration,
            index
        ) => {

            const team =
                registration.teams;


            if (!team) {

                console.warn(
                    "TEAM NOT FOUND:",
                    registration.team_id
                );

                return;
            }


            const teamName =
                team.name ||
                "UNKNOWN TEAM";


            const teamTag =
                team.tag ||
                "TEAM";


            const group =
                registration.group_name ||
                "NOT ASSIGNED";


            const currentStatus =
                registration.status ||
                "registered";


            let statusClass =
                "registered";

           ```javascript
// =========================================
// SCORE ENTRY
// =========================================

let adminRegisteredTeams = [];

async function loadScoreTeams() {

    const select =
        document.getElementById("scoreTeamSelect");

    if (!select) return;


    const { data, error } =
        await adminClient
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


    select.innerHTML =
        `<option value="">SELECT TEAM</option>`;


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
                    ${team.tag
                        ? " [" + team.tag + "]"
                        : ""}
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
            document.getElementById(
                "scoreWins"
            )?.value || 0
        );


    const placement =
        Number(
            document.getElementById(
                "scorePlacement"
            )?.value || 0
        );


    const kills =
        Number(
            document.getElementById(
                "scoreKills"
            )?.value || 0
        );


    const total =
        wins +
        placement +
        kills;


    const preview =
        document.getElementById(
            "scoreTotalPreview"
        );


    if (preview) {
        preview.textContent = total;
    }


    return total;
}


// =========================================
// SCORE INPUT LISTENERS
// =========================================

[
    "scoreWins",
    "scorePlacement",
    "scoreKills"
].forEach(
    id => {

        const input =
            document.getElementById(id);


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
    document.getElementById(
        "saveTeamScore"
    );


if (saveTeamScore) {

    saveTeamScore.addEventListener(
        "click",
        async function() {

            const teamId =
                document.getElementById(
                    "scoreTeamSelect"
                ).value;


            const matches =
                Number(
                    document.getElementById(
                        "scoreMatches"
                    ).value || 0
                );


            const wins =
                Number(
                    document.getElementById(
                        "scoreWins"
                    ).value || 0
                );


            const placement =
                Number(
                    document.getElementById(
                        "scorePlacement"
                    ).value || 0
                );


            const kills =
                Number(
                    document.getElementById(
                        "scoreKills"
                    ).value || 0
                );


            const total =
                wins +
                placement +
                kills;


            const message =
                document.getElementById(
                    "scoreSaveMessage"
                );


            if (!teamId) {

                message.textContent =
                    "PLEASE SELECT A TEAM";

                return;
            }


            saveTeamScore.disabled =
                true;


            message.textContent =
                "SAVING SCORE...";


            const { error } =
                await adminClient
                    .from("tournament_scores")
                    .upsert(
                        {
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
                                new Date()
                                    .toISOString()
                        },
                        {
                            onConflict:
                                "tournament_id,team_id"
                        }
                    );


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


            console.log(
                "SCORE SAVED:",
                teamId
            );

        }
    );

}


// =========================================
// ANNOUNCEMENTS
// =========================================

async function loadAdminAnnouncements() {

    const container =
        document.getElementById(
            "adminAnnouncements"
        );


    if (!container) return;


    const { data, error } =
        await adminClient
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


    if (!data || data.length === 0) {

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
                        onclick="deleteAnnouncement('${announcement.id}')"
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
    document.getElementById(
        "publishAnnouncement"
    );


if (publishAnnouncement) {

    publishAnnouncement.addEventListener(
        "click",
        async function() {

            const title =
                document.getElementById(
                    "announcementTitle"
                ).value.trim();


            const content =
                document.getElementById(
                    "announcementMessage"
                ).value.trim();


            const published =
                document.getElementById(
                    "announcementPublished"
                ).value === "true";


            const status =
                document.getElementById(
                    "announcementMessageStatus"
                );


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


            const { error } =
                await adminClient
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


            document.getElementById(
                "announcementTitle"
            ).value = "";


            document.getElementById(
                "announcementMessage"
            ).value = "";


            document.getElementById(
                "announcementPublished"
            ).value = "true";


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


    const { error } =
        await adminClient
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
// START SCORE + ANNOUNCEMENTS
// =========================================

loadScoreTeams();

loadAdminAnnouncements();
```
         
        
