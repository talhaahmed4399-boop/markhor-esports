const tournamentClient = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);

const tournamentBox =
    document.getElementById("dynamicTournaments");

async function loadTournaments() {

    console.log("TOURNAMENT JS STARTED");

    if (!tournamentBox) {
        console.error("dynamicTournaments element NOT FOUND");
        return;
    }

    const {
        data,
        error
    } = await tournamentClient
        .from("tournaments")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    console.log("TOURNAMENT DATA:", data);
    console.log("TOURNAMENT ERROR:", error);

    if (error) {

        tournamentBox.innerHTML = `
            <div style="padding:20px">
                TOURNAMENT LOAD ERROR
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        tournamentBox.innerHTML = `
            <div style="padding:20px">
                NO TOURNAMENTS FOUND
            </div>
        `;

        return;
    }

    tournamentBox.innerHTML = "";

    data.forEach(tournament => {

        tournamentBox.innerHTML += `

        <article>

            <div class="cover c1">
                ${String(
                    tournament.registration_status || "OPEN"
                ).toUpperCase()}
            </div>

            <div class="body">

                <small>
                    PUBG MOBILE • SQUAD
                </small>

                <h3>
                    ${tournament.name}
                </h3>

                <div class="meta">

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

                    <span>
                        STATUS
                        <strong>
                            ${tournament.tournament_status || "UPCOMING"}
                        </strong>
                    </span>

                </div>

              <button
    class="tournament-register-btn"
    onclick="registerTournament('${tournament.id}')"
>
    REGISTER TEAM →
</button>

<a
    class="tournament-view-btn"
    href="tournament.html?id=${tournament.id}"
>
    VIEW TOURNAMENT →
</a>
            </div>

        </article>

        `;

    });

}

loadTournaments();
