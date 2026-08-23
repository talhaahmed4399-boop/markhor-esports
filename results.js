// =========================================
// MARKHOR ESPORTS
// LIVE TOURNAMENT RESULTS
// =========================================


console.log(
    "MARKHOR RESULTS STARTED"
);


const resultsClient =
    window.supabase.createClient(
        window.MARKHOR_CONFIG.supabaseUrl,
        window.MARKHOR_CONFIG.supabasePublishableKey
    );


const RESULTS_TOURNAMENT_ID =
    "12315134-ab7a-4705-baf6-92897fa09b50";


const podium =
    document.getElementById(
        "podium"
    );


const resultsList =
    document.getElementById(
        "resultsList"
    );


async function loadTournamentResults() {

    console.log(
        "LOADING TOURNAMENT RESULTS..."
    );


    const {
        data,
        error
    } = await resultsClient
        .from("tournament_results")
        .select(`
            id,
            position,
            prize_amount,
            teams (
                id,
                name,
                tag,
                logo_url
            )
        `)
        .eq(
            "tournament_id",
            RESULTS_TOURNAMENT_ID
        )
        .order(
            "position",
            {
                ascending: true
            }
        );


    console.log(
        "RESULTS DATA:",
        data
    );


    if (error) {

        console.error(
            "RESULTS ERROR:",
            error
        );


        podium.innerHTML =
            '<div class="results-loading">' +
            'UNABLE TO LOAD RESULTS' +
            '</div>';


        resultsList.innerHTML = "";

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        podium.innerHTML =
            '<div class="results-loading">' +
            'NO RESULTS AVAILABLE YET' +
            '</div>';


        resultsList.innerHTML = "";

        return;
    }


    renderPodium(data);

    renderResults(data);


    const status =
        document.getElementById(
            "resultsStatus"
        );


    if(status) {

        status.textContent =
            "LIVE • UPDATED " +
            new Date()
                .toLocaleTimeString();

    }

}



function renderPodium(data) {

    const first =
        data.find(
            item =>
                item.position === 1
        );


    const second =
        data.find(
            item =>
                item.position === 2
        );


    const third =
        data.find(
            item =>
                item.position === 3
        );


    podium.innerHTML = "";


    if(second) {

        podium.innerHTML +=
            createPodiumCard(
                second,
                "🥈",
                "2ND PLACE",
                "second"
            );

    }


    if(first) {

        podium.innerHTML +=
            createPodiumCard(
                first,
                "🥇",
                "1ST PLACE",
                "first"
            );

    }


    if(third) {

        podium.innerHTML +=
            createPodiumCard(
                third,
                "🥉",
                "3RD PLACE",
                "third"
            );

    }

}



function createPodiumCard(
    result,
    medal,
    position,
    className
) {

    const team =
        result.teams || {};


    const teamName =
        team.name ||
        "UNKNOWN TEAM";


    const tag =
        team.tag ||
        "";


    const prize =
        Number(
            result.prize_amount || 0
        ).toLocaleString();


    return `

        <div class="podium-card ${className}">

            <div class="medal">
                ${medal}
            </div>

            <div class="position-label">
                ${position}
            </div>

            <h3>
                ${teamName}
            </h3>

            <div class="podium-tag">
                ${tag}
            </div>

            <div class="podium-prize">

                PRIZE

                <strong>
                    ₨${prize}
                </strong>

            </div>

        </div>

    `;

}



function renderResults(data) {

    resultsList.innerHTML = "";


    data.forEach(
        result => {

            const team =
                result.teams || {};


            const teamName =
                team.name ||
                "UNKNOWN TEAM";


            const tag =
                team.tag ||
                "";


            const prize =
                Number(
                    result.prize_amount || 0
                ).toLocaleString();


            let logoHTML;


            if(team.logo_url) {

                logoHTML =

                    '<img ' +

                    'src="' +
                    team.logo_url +
                    '" ' +

                    'alt="' +
                    teamName +
                    '" ' +

                    'class="result-logo">';

            } else {

                logoHTML =

                    '<div class="' +
                    'result-logo ' +
                    'result-logo-placeholder">' +

                    teamName
                        .charAt(0)
                        .toUpperCase() +

                    '</div>';

            }


            resultsList.innerHTML +=

                '<div class="result-row">' +

                    '<div class="result-position">' +

                        String(
                            result.position
                        ).padStart(
                            2,
                            "0"
                        ) +

                    '</div>' +


                    '<div class="result-team">' +

                        logoHTML +

                        '<div>' +

                            '<strong>' +
                                teamName +
                            '</strong>' +

                            '<small>' +
                                tag +
                            '</small>' +

                        '</div>' +

                    '</div>' +


                    '<div class="result-prize">' +

                        'PRIZE' +

                        '<strong>' +
                            '₨' +
                            prize +
                        '</strong>' +

                    '</div>' +

                '</div>';

        }
    );

}



loadTournamentResults();


setInterval(
    loadTournamentResults,
    15000
);
