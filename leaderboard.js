// =========================================
// MARKHOR ESPORTS LIVE LEADERBOARD
// =========================================

console.log(
    "MARKHOR LEADERBOARD STARTED"
);


const leaderboardClient =
    window.supabase.createClient(
        window.MARKHOR_CONFIG.supabaseUrl,
        window.MARKHOR_CONFIG.supabasePublishableKey
    );


const TOURNAMENT_ID =
    "12315134-ab7a-4705-baf6-92897fa09b50";


const leaderboardBody =
    document.getElementById(
        "leaderboardBody"
    );


async function loadLeaderboard() {

    console.log(
        "LOADING LEADERBOARD..."
    );


    const {
        data,
        error
    } =
        await leaderboardClient
        .from("tournament_scores")
        .select(`
            id,
            matches_played,
            wins,
            placement_points,
            kill_points,
            total_points,
            updated_at,
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
            "total_points",
            {
                ascending: false
            }
        );


    console.log(
        "LEADERBOARD DATA:",
        data
    );


    console.log(
        "LEADERBOARD ERROR:",
        error
    );


    if (error) {

        leaderboardBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="leaderboard-loading"
                >
                    UNABLE TO LOAD LEADERBOARD
                </td>

            </tr>

        `;

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        leaderboardBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="leaderboard-loading"
                >
                    NO RANKINGS AVAILABLE YET
                </td>

            </tr>

        `;

        return;
    }


    leaderboardBody.innerHTML = "";


    data.forEach(
        (
            score,
            index
        ) => {

            const team =
                score.teams;


            const teamName =
                team?.name ||
                "UNKNOWN TEAM";


            const teamTag =
                team?.tag ||
                "";


            const teamLogo =
                team?.logo_url ||
                "";


            let rankClass =
                "";


            if (index === 0) {

                rankClass =
                    "rank-first";

            } else if (
                index === 1
            ) {

                rankClass =
                    "rank-second";

            } else if (
                index === 2
            ) {

                rankClass =
                    "rank-third";
            }


            const logoHTML =
                teamLogo

                ?

                `
                    <img
                        src="${teamLogo}"
                        class="leaderboard-team-logo"
                        alt="${teamName}"
                    >
                `

                :

                `
                    <div
                        class="
                            leaderboard-team-logo
                            leaderboard-logo-placeholder
                        "
                    >
                        ${teamName
                            .charAt(0)
                            .toUpperCase()}
                    </div>
                `;


            leaderboardBody.innerHTML += `

                <tr>

                    <td>

                        <span
                            class="
                                leaderboard-rank
                                ${rankClass}
                            "
                        >
                            ${index + 1}
                        </span>

                    </td>


                    <td>

                        <div
                            class="leaderboard-team-cell"
                        >

                            ${logoHTML}

                            <div>

                                <strong>
                                    ${teamName}
                                </strong>

                                <small>
                                    ${teamTag}
                                </small>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${score.matches_played || 0}
                    </td>


                    <td>
                        ${score.wins || 0}
                    </td>


                    <td>
                        ${score.placement_points || 0}
                    </td>


                    <td>
                        ${score.kill_points || 0}
                    </td>


                    <td>

                        <strong
                            class="leaderboard-total"
                        >
                            ${score.total_points || 0}
                        </strong>

                    </td>

                </tr>

            `;

        }
    );


    const updated =
        document.getElementById(
            "leaderboardUpdated"
        );


    if (updated) {

        updated.textContent =
            "LIVE • UPDATED " +
            new Date()
                .toLocaleTimeString();
    }
}


// Initial load
loadLeaderboard();


// Refresh every 15 seconds
setInterval(
    loadLeaderboard,
    15000
);
