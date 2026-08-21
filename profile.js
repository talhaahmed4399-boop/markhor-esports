const supabaseClient = window.supabase.createClient(
    window.MARKHOR_CONFIG.supabaseUrl,
    window.MARKHOR_CONFIG.supabasePublishableKey
);

async function loadPlayerProfile() {

    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {

        window.location.href = "index.html";

        return;
    }

    const userId = sessionData.session.user.id;

    const { data: profile, error } =
        await supabaseClient
            .from("profiles")
            .select("username, full_name, pubg_uid, country")
            .eq("id", userId)
            .maybeSingle();

    if (error) {

        console.log("Profile error:", error.message);

        document.getElementById("profileMessage").textContent =
            "Unable to load profile.";

        return;
    }

    if (!profile) {

        document.getElementById("profileMessage").textContent =
            "Profile not found.";

        return;
    }

    document.getElementById("profileUsername").textContent =
        profile.username || "-";

    document.getElementById("profileFullName").textContent =
        profile.full_name || "-";

    document.getElementById("profilePubgUid").textContent =
        profile.pubg_uid || "-";

    document.getElementById("profileCountry").textContent =
        profile.country || "Pakistan";

    document.getElementById("profileName").textContent =
        profile.username || "PLAYER";
}


/* EDIT PROFILE */

document.getElementById("editProfile").onclick = function () {

    window.location.href = "index.html#account";

};


/* LOGOUT */

document.getElementById("logoutBtn").onclick = async function () {

    await supabaseClient.auth.signOut();

    window.location.href = "index.html";

};


/* LOAD PROFILE */

loadPlayerProfile();
