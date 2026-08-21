const client = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);

const message = document.getElementById("teamMessage");
const createButton = document.getElementById("createTeam");


async function createTeam() {

    message.textContent = "Checking account...";
    createButton.disabled = true;

    try {

        const {
            data: sessionData,
            error: sessionError
        } = await client.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        if (!sessionData.session) {

            message.textContent =
                "Please login before creating a team.";

            createButton.disabled = false;

            return;
        }


        const userId = sessionData.session.user.id;


        const teamName =
            document.getElementById("teamName").value.trim();

        const teamTag =
            document.getElementById("teamTag").value.trim().toUpperCase();

        const iglName =
            document.getElementById("iglName").value.trim();

        const whatsapp =
            document.getElementById("whatsapp").value.trim();

        const teamLogo =
            document.getElementById("teamLogo").value.trim();

        const player1Name =
            document.getElementById("player1Name").value.trim();

        const player1Uid =
            document.getElementById("player1Uid").value.trim();

        const player2Name =
            document.getElementById("player2Name").value.trim();

        const player2Uid =
            document.getElementById("player2Uid").value.trim();

        const player3Name =
            document.getElementById("player3Name").value.trim();

        const player3Uid =
            document.getElementById("player3Uid").value.trim();

        const player4Name =
            document.getElementById("player4Name").value.trim();

        const player4Uid =
            document.getElementById("player4Uid").value.trim();

        const sub1Name =
            document.getElementById("sub1Name").value.trim();

        const sub1Uid =
            document.getElementById("sub1Uid").value.trim();

        const sub2Name =
            document.getElementById("sub2Name").value.trim();

        const sub2Uid =
            document.getElementById("sub2Uid").value.trim();


        if (
            !teamName ||
            !teamTag ||
            !iglName ||
            !whatsapp ||
            !player1Name ||
            !player1Uid ||
            !player2Name ||
            !player2Uid ||
            !player3Name ||
            !player3Uid ||
            !player4Name ||
            !player4Uid
        ) {

            message.textContent =
                "Please fill all required fields.";

            createButton.disabled = false;

            return;
        }


        message.textContent =
            "Creating your team...";


        const { data: team, error: teamError } =
            await client
                .from("teams")
                .insert({

                    name: teamName,

                    tag: teamTag,

                    logo_url: teamLogo || null,

                    captain_id: userId,

                    description: null,

                    igl_name: iglName,

                    whatsapp: whatsapp,

                    player1_name: player1Name,

                    player1_uid: player1Uid,

                    player2_name: player2Name,

                    player2_uid: player2Uid,

                    player3_name: player3Name,

                    player3_uid: player3Uid,

                    player4_name: player4Name,

                    player4_uid: player4Uid,

                    sub1_name: sub1Name || null,

                    sub1_uid: sub1Uid || null,

                    sub2_name: sub2Name || null,

                    sub2_uid: sub2Uid || null

                })

                .select()

                .single();


        if (teamError) {
            throw teamError;
        }


        const { error: memberError } =
            await client
                .from("team_members")
                .insert({

                    team_id: team.id,

                    player_id: userId,

                    role: "captain"

                });


        if (memberError) {
            throw memberError;
        }


        message.textContent =
            "Team created successfully!";


        createButton.textContent =
            "TEAM CREATED ✓";


        createButton.disabled = true;


        setTimeout(function () {

            window.location.href =
                "team.html";

        }, 1500);


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message || "Unable to create team.";

        createButton.disabled = false;

    }

}


createButton.addEventListener(
    "click",
    createTeam
);
