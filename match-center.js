// =========================================
// PUBLIC MATCH CENTER
// =========================================

async function loadPublicMatches() {

    const box = document.getElementById("publicMatches");

    if (!box) return;

    const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_no", { ascending: true });

    if (error) {

        console.error("MATCH LOAD ERROR:", error);

        box.innerHTML = `
            <p class="match-loading">
                MATCHES COULD NOT BE LOADED
            </p>
        `;

        return;
    }

    if (!data || data.length === 0) {

        box.innerHTML = `
            <p class="match-loading">
                NO MATCHES SCHEDULED
            </p>
        `;

        return;
    }

    box.innerHTML = "";

    data.forEach(match => {

        let statusClass = "upcoming";

        if (match.status === "LIVE") {
            statusClass = "live";
        }

        if (match.status === "COMPLETED") {
            statusClass = "completed";
        }

        let formattedDate = "";

        if (match.scheduled_at) {

            const date =
                new Date(match.scheduled_at);

            formattedDate =
                date.toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        }

        let formattedTime = "";

        if (match.match_time) {

            const time =
                new Date(match.match_time);

            formattedTime =
                time.toLocaleTimeString(
                    "en-US",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

        }

        box.innerHTML += `

        <div class="match-card">

            <div class="match-map">

                ${
                    match.map_image
                    ?
                    `<img
                        src="${match.map_image}"
                        alt="${match.map}">
                    `
                    :
                    `<div class="no-map-image">
                        ${match.map}
                    </div>`
                }

            </div>

            <div class="match-info">

                <small>
                    MATCH ${String(match.match_no).padStart(2, "0")}
                </small>

                <h3>
                    ${match.map || "MAP"}
                </h3>

                <span>
                    ${match.round || ""}
                </span>

                <p>
                    ${formattedDate}
                    <br>
                    ${formattedTime}
                </p>

            </div>

            <div class="match-status ${statusClass}">
                ${match.status}
            </div>

        </div>

        `;

    });

}

loadPublicMatches();
