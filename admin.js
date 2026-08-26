// =========================================
// MARKHOR ESPORTS ADMIN PANEL
// CLEAN ADMIN.JS
// =========================================

console.log("MARKHOR ADMIN PANEL STARTED");


// =========================================
// SUPABASE
// =========================================

const adminClient =
    window.supabase.createClient(
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

    const element = $(id);

    if (element) {
        element.textContent = value;
    }
}


// =========================================
// ADMIN ACCESS
// =========================================

async function checkAdmin() {

    console.log("CHECKING ADMIN...");

    const result =
        await adminClient.auth.getUser();

    const user =
        result.data &&
        result.data.user;

    if (result.error) {

        console.error(
            "AUTH ERROR:",
            result.error
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


    if ($("adminLoading")) {

        $("adminLoading").style.display =
            "none";
    }


    if ($("adminPanel")) {

        $("adminPanel").style.display =
            "block";
    }


    await loadDashboard();

    await loadScoreTeams();

    await loadAdminAnnouncements();
}


// =========================================
// ACCESS DENIED
// =========================================

function showAccessDenied(message) {

    const loading =
        $("adminLoading");

    if (!loading) {
        return;
    }


    loading.innerHTML =
        "<div>" +

            "<h2>" +
                message +
            "</h2>" +

            "<p>" +
                "You do not have permission to access this page." +
            "</p>" +

            '<a href="index.html" class="lime">' +
                "BACK TO WEBSITE" +
            "</a>" +

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

    const box =
        $("adminTournaments");

    if (!box) {
        return;
    }


    const result =
        await adminClient
            .from("tournaments")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    const data =
        result.data || [];


    if (result.error) {

        console.error(
            "TOURNAMENT ERROR:",
            result.error
        );

        box.textContent =
            "TOURNAMENT LOAD ERROR";

        return;
    }


    console.log(
        "ADMIN TOURNAMENTS:",
        data
    );


    setText(
        "totalTournaments",
        data.length
    );


    if (!data.length) {

        box.textContent =
            "NO TOURNAMENTS FOUND";

        return;
    }


    let html = "";


    data.forEach(
        function(tournament) {

            const status =
                tournament.status ||
                tournament.tournament_status ||
                "upcoming";


            html +=
                '<div class="admin-tournament">' +

                    '<div>' +

                        '<small>' +
                            String(
                                status
                            ).toUpperCase() +
                        '</small>' +

                        '<h3>' +
                            (
                                tournament.name ||
                                "UNTITLED TOURNAMENT"
                            ) +
                        '</h3>' +

                    '</div>' +

                    '<div class="admin-tournament-meta">' +

                        '<span>' +
                            'PRIZE ' +

                            '<strong>' +
                                '₨' +
                                (
                                    tournament.prize_pool ||
                                    0
                                ) +
                            '</strong>' +

                        '</span>' +

                        '<span>' +
                            'TEAMS ' +

                            '<strong>' +
                                (
                                    tournament.max_teams ||
                                    0
                                ) +
                            '</strong>' +

                        '</span>' +

                    '</div>' +

                '</div>';
        }
    );


    box.innerHTML =
        html;


    const tournament =
        data.find(
            function(item) {

                return item.id ===
                    TOURNAMENT_ID;
            }
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

    const box =
        $("adminTeams");

    if (!box) {
        return;
    }


    const result =
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


    const data =
        result.data || [];


    if (result.error) {

        console.error(
            "REGISTRATION ERROR:",
            result.error
        );

        box.textContent =
            "REGISTRATION LOAD ERROR";

        return;
    }


    console.log(
        "ADMIN REGISTRATIONS:",
        data
    );


    setText(
        "totalRegistrations",
        data.length
    );


    setText(
        "adminTeamCount",
        data.length
    );


    if (!data.length) {

        box.textContent =
            "NO REGISTERED TEAMS";

        loadGroups([]);

        return;
    }


    let html = "";


    data.forEach(
        function(registration, index) {

            const team =
                registration.teams;


            if (!team) {
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


            const status =
                registration.status ||
                "registered";


            let statusClass =
                "registered";


            if (status === "approved") {

                statusClass =
                    "approved";
            }


            if (status === "rejected") {

                statusClass =
                    "rejected";
            }


            let logo;


            if (team.logo_url) {

                logo =
                    '<img src="' +
                    team.logo_url +
                    '" alt="' +
                    teamName +
                    '" class="admin-team-logo">';
            }

            else {

                logo =
                    '<div class="admin-team-logo-placeholder">' +
                        teamName
                            .charAt(0)
                            .toUpperCase() +
                    '</div>';
            }


            const date =
                registration.created_at
                    ? new Date(
                        registration.created_at
                    ).toLocaleDateString()
                    : "-";


            html +=
                '<div class="admin-team-card">' +

                    '<div class="admin-team-number">' +
                        String(
                            index + 1
                        ).padStart(
                            2,
                            "0"
                        ) +
                    '</div>' +

                    logo +

                    '<div class="admin-team-info">' +

                        '<h3>' +
                            teamName +
                        '</h3>' +

                        '<small>' +
                            'TAG: ' +
                            teamTag +
                        '</small>' +

                        '<span>' +
                            'GROUP: ' +
                            group +
                        '</span>' +

                        '<span>' +
                            'REGISTERED: ' +
                            date +
                        '</span>' +

                    '</div>' +

                    '<div class="admin-team-actions">' +

                        '<span class="admin-registration-status ' +
                            statusClass +
                        '">' +

                            String(
                                status
                            ).toUpperCase() +

                        '</span>' +

                        '<button ' +
                            'type="button" ' +
                            'class="admin-approve-btn" ' +
                            'onclick="updateRegistrationStatus(\'' +
                                registration.id +
                            '\', \'approved\')">' +

                            'APPROVE' +

                        '</button>' +

                        '<button ' +
                            'type="button" ' +
                            'class="admin-reject-btn" ' +
                            'onclick="updateRegistrationStatus(\'' +
                                registration.id +
                            '\', \'rejected\')">' +

                            'REJECT' +

                        '</button>' +

                    '</div>' +

                '</div>';
        }
    );


    box.innerHTML =
        html ||
        "NO REGISTERED TEAMS";


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


    const result =
        await adminClient
            .from("tournament_registrations")
            .update({
                status:
                    newStatus
            })
            .eq(
                "id",
                registrationId
            );


    if (result.error) {

        console.error(
            "STATUS UPDATE ERROR:",
            result.error
        );

        alert(
            "Unable to update registration."
        );

        return;
    }


    console.log(
        "REGISTRATION UPDATED:",
        newStatus
    );


    await loadRegistrations();

    await loadScoreTeams();
}


window.updateRegistrationStatus =
    updateRegistrationStatus;


// =========================================
// GROUPS
// =========================================

function loadGroups(registrations) {

    const box =
        $("adminGroups");

    if (!box) {
        return;
    }


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
        function(registration) {

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
        function(groupName) {

            const teams =
                groups[groupName];


            if (!teams.length) {
                return;
            }


            html +=
                '<div class="admin-group">' +

                    '<div class="admin-group-header">' +

                        '<strong>' +
                            groupName +
                        '</strong>' +

                        '<span>' +
                            teams.length +
                            ' / 16' +
                        '</span>' +

                    '</div>' +

                    '<div class="admin-group-teams">';


            teams.forEach(
                function(registration) {

                    const team =
                        registration.teams;


                    if (!team) {
                        return;
                    }


                    html +=
                        '<div>' +

                            '<strong>' +
                                (
                                    team.name ||
                                    "UNKNOWN TEAM"
                                ) +
                            '</strong>' +

                            '<small>' +
                                (
                                    team.tag ||
                                    ""
                                ) +
                            '</small>' +

                        '</div>';
                }
            );


            html +=
                    '</div>' +

                '</div>';
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

    if (!button) {
        return;
    }


    if (
        String(status)
            .toLowerCase() ===
        "open"
    ) {

        button.textContent =
            "REGISTRATION OPEN ✓";

        button.className =
            "lime";
    }

    else {

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


            const result =
                await adminClient
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


            if (result.error) {

                console.error(
                    "REGISTRATION STATUS ERROR:",
                    result.error
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


            const result =
                await adminClient
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


            if (result.error) {

                console.error(
                    "TOURNAMENT SAVE ERROR:",
                    result.error
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

    if (!select) {
        return;
    }


    const result =
        await adminClient
            .from("tournament_registrations")
            .select(`
                team_id,
                status,
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


    const data =
        result.data || [];


    if (result.error) {

        console.error(
            "SCORE TEAM ERROR:",
            result.error
        );

        return;
    }


    console.log(
        "SCORE TEAMS:",
        data
    );


    adminRegisteredTeams =
        data;


    select.innerHTML =
        '<option value="">' +
            'SELECT TEAM' +
        '</option>';


    adminRegisteredTeams.forEach(
        function(registration) {

            if (!registration.teams) {
                return;
            }


            const team =
                registration.teams;


            select.innerHTML +=
                '<option value="' +
                    registration.team_id +
                '">' +

                    (
                        team.name ||
                        "UNKNOWN TEAM"
                    ) +

                    (
                        team.tag
                            ? ' [' +
                              team.tag +
                              ']'
                            : ""
                    ) +

                '</option>';
        }
    );
}


// =========================================
// SCORE TOTAL
// =========================================

function calculateScoreTotal() {

    const wins =
        Number(
            $("scoreWins")?.value ||
            0
        );


    const placement =
        Number(
            $("scorePlacement")?.value ||
            0
        );


    const kills =
        Number(
            $("scoreKills")?.value ||
            0
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
    function(id) {

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
                    $("scoreMatches").value ||
                    0
                );


            const wins =
                Number(
                    $("scoreWins").value ||
                    0
                );


            const placement =
                Number(
                    $("scorePlacement").value ||
                    0
                );


            const kills =
                Number(
                    $("scoreKills").value ||
                    0
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


            const result =
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


            if (result.error) {

                console.error(
    "SCORE SAVE ERROR:",
    JSON.stringify(error, null, 2)
);

alert(
    JSON.stringify(error, null, 2)
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

    if (!container) {
        return;
    }


    const result =
        await adminClient
            .from("announcements")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    const data =
        result.data || [];


    if (result.error) {

        console.error(
            "ANNOUNCEMENT LOAD ERROR:",
            result.error
        );

        container.textContent =
            "UNABLE TO LOAD ANNOUNCEMENTS";

        return;
    }


    console.log(
        "ADMIN ANNOUNCEMENTS:",
        data
    );


    if (!data.length) {

        container.textContent =
            "NO ANNOUNCEMENTS YET";

        return;
    }


    container.innerHTML =
        "";


    data.forEach(
        function(announcement) {

            const status =
                announcement.published
                    ? "PUBLISHED"
                    : "DRAFT";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-announcement-card";


            const content =
                document.createElement(
                    "div"
                );


            const small =
                document.createElement(
                    "small"
                );


            small.textContent =
                "ANNOUNCEMENT";


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                announcement.title ||
                "";


            const message =
                document.createElement(
                    "p"
                );


            message.textContent =
                announcement.content ||
                "";


            const statusElement =
                document.createElement(
                    "span"
                );


            statusElement.textContent =
                status;


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "outline";


            deleteButton.textContent =
                "DELETE";


            deleteButton.addEventListener(
                "click",
                async function() {

                    await deleteAnnouncement(
                        announcement.id
                    );
                }
            );


            content.appendChild(
                small
            );


            content.appendChild(
                title
            );


            content.appendChild(
                message
            );


            content.appendChild(
                statusElement
            );


            card.appendChild(
                content
            );


            card.appendChild(
                deleteButton
            );


            container.appendChild(
                card
            );
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

            const titleElement =
                $("announcementTitle");


            const messageElement =
                $("announcementMessage");


            const publishedElement =
                $("announcementPublished");


            const statusElement =
                $("announcementMessageStatus");


            const title =
                titleElement
                    ? titleElement.value.trim()
                    : "";


            const content =
                messageElement
                    ? messageElement.value.trim()
                    : "";


            const published =
                publishedElement
                    ? publishedElement.value ===
                      "true"
                    : true;


            if (!title) {

                statusElement.textContent =
                    "PLEASE ENTER A TITLE";

                return;
            }


            if (!content) {

                statusElement.textContent =
                    "PLEASE ENTER A MESSAGE";

                return;
            }


            publishAnnouncement.disabled =
                true;


            statusElement.textContent =
                "PUBLISHING...";


            const result =
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


            if (result.error) {

                console.error(
                    "ANNOUNCEMENT SAVE ERROR:",
                    result.error
                );

                statusElement.textContent =
                    "FAILED TO PUBLISH ANNOUNCEMENT";

                return;
            }


            statusElement.textContent =
                "ANNOUNCEMENT PUBLISHED ✓";


            if (titleElement) {

                titleElement.value =
                    "";
            }


            if (messageElement) {

                messageElement.value =
                    "";
            }


            if (publishedElement) {

                publishedElement.value =
                    "true";
            }


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


    if (!confirmed) {
        return;
    }


    const result =
        await adminClient
            .from("announcements")
            .delete()
            .eq(
                "id",
                id
            );


    if (result.error) {

        console.error(
            "ANNOUNCEMENT DELETE ERROR:",
            result.error
        );

        alert(
            "FAILED TO DELETE ANNOUNCEMENT"
        );

        return;
    }


    await loadAdminAnnouncements();
}


window.deleteAnnouncement =
    deleteAnnouncement;


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
// TOURNAMENT RESULTS
// =========================================


async function loadResultTeams(){

    const select =
        $("resultTeamSelect");


    if(!select){
        return;
    }


    const {
        data,
        error
    } =
    await adminClient
    .from("tournament_registrations")
    .select(`
        team_id,
        teams(
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


    if(error){

        console.error(
            "RESULT TEAM ERROR",
            error
        );

        return;
    }


    select.innerHTML =
    `
    <option value="">
        SELECT TEAM
    </option>
    `;


    data.forEach(
        registration=>{


            if(!registration.teams){
                return;
            }


            select.innerHTML +=

            `
            <option value="${registration.team_id}">

            ${registration.teams.name}

            ${
                registration.teams.tag
                ?
                "["+registration.teams.tag+"]"
                :
                ""
            }

            </option>
            `;


        }
    );

}



async function saveTournamentResult(){

    const teamId =
        $("resultTeamSelect").value;


    const position =
        Number(
            $("resultPosition").value
        );


    const prize =
        Number(
            $("resultPrize").value || 0
        );


    const message =
        $("resultSaveMessage");


    if(!teamId){

        message.textContent =
        "PLEASE SELECT TEAM";

        return;

    }


    message.textContent =
    "SAVING...";


    const {
        error
    } =

    await adminClient
    .from("tournament_results")
    .upsert({

        tournament_id:
            TOURNAMENT_ID,

        team_id:
            teamId,

        position:
            position,

        prize_amount:
            prize

    },{
        onConflict:
        "tournament_id,position"
    });



    if(error){

        console.error(
    "RESULT SAVE ERROR:",
    JSON.stringify(error, null, 2)
);

alert(
    JSON.stringify(error, null, 2)
);


        message.textContent =
        "RESULT SAVE FAILED";


        return;

    }


    message.textContent =
    "RESULT SAVED ✓";


    await loadTournamentResults();

}



async function loadTournamentResults(){

    const box =
        $("adminResults");


    if(!box){
        return;
    }


    const {
        data,
        error
    } =

    await adminClient
    .from("tournament_results")
    .select(`
        position,
        prize_amount,
        teams(
            name,
            tag
        )
    `)
    .eq(
        "tournament_id",
        TOURNAMENT_ID
    )
    .order(
        "position",
        {
            ascending:true
        }
    );


    if(error){

        console.error(
            "RESULT LOAD ERROR",
            error
        );

        return;
    }


    if(!data.length){

        box.innerHTML =
        "NO RESULTS YET";

        return;

    }


    box.innerHTML="";


    data.forEach(
        result=>{


        box.innerHTML +=

        `
        <div class="admin-team-card">

            <h3>
            #${result.position}
            ${result.teams?.name || ""}
            </h3>

            <p>
            PRIZE:
            ₨${result.prize_amount}
            </p>

        </div>
        `;


        }
    );

}



// BUTTON

const saveTournamentResultBtn =
    $("saveTournamentResult");


if(saveTournamentResultBtn){

    saveTournamentResultBtn.addEventListener(
        "click",
        saveTournamentResult
    );

}


// LOAD

loadResultTeams();

loadTournamentResults();

// =========================================
// MVP SYSTEM
// =========================================


async function loadMvpLeaderboard(){

    const box =
        $("mvpLeaderboard");

    if(!box) return;


    const {
        data,
        error
    } = await adminClient
        .from("mvp_match_stats")
        .select("*");


    if(error){

        console.error(
            "MVP LOAD ERROR:",
            error
        );

        box.innerHTML =
            "MVP LOAD FAILED";

        return;
    }


    if(!data || data.length === 0){

        box.innerHTML =
            "NO MVP STATS YET";

        return;
    }


    let players = {};


    data.forEach(stat => {


        if(!players[stat.player_name]){

            players[stat.player_name] = {

                name:
                stat.player_name,

                team:
                stat.team_name,

                tag:
                stat.team_tag,

                kills:0,

                damage:0,

                matches:0
            };

        }


        players[stat.player_name].kills +=
            stat.kills;


        players[stat.player_name].damage +=
            stat.damage;


        players[stat.player_name].matches++;

    });



    const leaderboard =
        Object.values(players)
        .sort(
            (a,b)=>
            b.kills-a.kills
        );



    box.innerHTML = "";


    leaderboard.forEach(
        (player,index)=>{


        box.innerHTML += `

        <div class="admin-team-card">

            <div class="admin-team-number">
                ${index+1}
            </div>


            <div class="admin-team-info">

                <h3>
                ${player.name}
                </h3>


                <small>
                ${player.team}
                [${player.tag || ""}]
                </small>


                <span>
                ${player.matches} MATCHES
                </span>


                <span>
                🔥 ${player.kills} KILLS
                </span>


                <span>
                💥 ${player.damage} DAMAGE
                </span>


            </div>


        </div>

        `;


        }
    );

}



// ADD MVP STATS


const addMvpStats =
    $("addMvpStats");


if(addMvpStats){


addMvpStats.addEventListener(
"click",
async function(){


const player =
$("mvpPlayerName").value.trim();


const team =
$("mvpTeamName").value.trim();


const tag =
$("mvpTeamTag").value.trim();


const match =
Number(
$("mvpMatchNumber").value
);


const kills =
Number(
$("mvpKills").value
);


const damage =
Number(
$("mvpDamage").value
);



if(!player || !team){

alert(
"ENTER PLAYER AND TEAM"
);

return;

}



const {
error
}
=
await adminClient
.from("mvp_match_stats")
.insert({

tournament_id:
TOURNAMENT_ID,

player_name:
player,

team_name:
team,

team_tag:
tag,

match_number:
match,

kills:
kills,

damage:
damage

});



if(error){

console.error(
"MVP SAVE ERROR:",
error
);


$("mvpSaveMessage").textContent =
"MVP SAVE FAILED";


return;

}



$("mvpSaveMessage").textContent =
"MVP STATS SAVED ✓";



await loadMvpLeaderboard();


});


}



// CLEAR MVP


const clearMvp =
$("clearMvpLeaderboard");


if(clearMvp){


clearMvp.addEventListener(
"click",
async function(){


const confirmClear =
confirm(
"Clear MVP leaderboard?"
);


if(!confirmClear)
return;



const {
error
}
=
await adminClient
.from("mvp_match_stats")
.delete()
.neq(
"id",
"00000000-0000-0000-0000-000000000000"
);



if(error){

console.error(
"MVP CLEAR ERROR:",
error
);

alert(
"FAILED TO CLEAR MVP"
);

return;

}



loadMvpLeaderboard();


});


}

// =========================================
// START
// =========================================

checkAdmin();
// =========================================
// MATCH CENTER MANAGEMENT
// =========================================


async function loadAdminMatches(){

    const box = $("adminMatches");

    if(!box) return;


    const {data,error} = await adminClient
        .from("matches")
        .select("*")
        .order("created_at",{ascending:false});


    if(error){

        console.error(
            "MATCH LOAD ERROR",
            error
        );

        box.innerHTML =
        "MATCH LOAD FAILED";

        return;
    }


    if(!data.length){

        box.innerHTML =
        "NO MATCHES ADDED";

        return;
    }


    box.innerHTML="";


    data.forEach(match=>{


        box.innerHTML += `

        <div class="admin-team-card">

            <h3>
            ${match.match_no}
            </h3>

            <p>
            MAP:
            ${match.map}
            </p>

            <p>
            ROUND:
            ${match.round || "-"}
            </p>

            <p>
            TIME:
            ${match.match_time}
            </p>

            <span>
            ${match.status}
            </span>


            <button
            onclick="deleteMatch('${match.id}')">
            DELETE
            </button>


        </div>

        `;


    });


}




async function addMatch() {

    const matchDate = $("matchDate").value;
    const matchTime = $("matchTime").value;

    if (!matchDate || !matchTime) {
        alert("Please select match date and time.");
        return;
    }

    const matchDateTime =
        matchDate + "T" + matchTime + ":00";

    const match = {

        tournament_id: TOURNAMENT_ID,

        match_no: Number($("matchNo").value),

        map: $("matchMap").value,

        round: $("matchRound").value,

        map_image:
            $("matchImage").value || null,

        scheduled_at: matchDateTime,

        match_time: matchDateTime,

        status: $("matchStatus").value

    };


    const { data, error } =
        await adminClient
            .from("matches")
            .insert(match)
            .select();


    if (error) {

        console.error(
            "ADD MATCH ERROR:",
            error
        );

        alert(
            "Match add failed: " +
            error.message
        );

        return;
    }


    $("matchMessage").textContent =
        "MATCH ADDED SUCCESSFULLY";


    // Clear form
    $("matchNo").value = "";
    $("matchRound").value = "";
    $("matchImage").value = "";
    $("matchDate").value = "";
    $("matchTime").value = "";
    $("matchStatus").value = "UPCOMING";


    loadAdminMatches();

}




async function deleteMatch(id){


    await adminClient
    .from("matches")
    .delete()
    .eq(
        "id",
        id
    );


    loadAdminMatches();

}





const addMatchBtn =
$("addMatch");


if(addMatchBtn){

    addMatchBtn.addEventListener(
        "click",
        addMatch
    );

}



loadAdminMatches();
