let client = null;
let mode = "login";

const modal = document.getElementById("modal");
const msg = document.getElementById("message");
const status = document.getElementById("status");
const submit = document.getElementById("submit");

const usernameInput = document.getElementById("profileUsername");
const fullNameInput = document.getElementById("fullName");
const pubgUidInput = document.getElementById("pubgUid");
const countryInput = document.getElementById("country");
const saveProfileBtn = document.getElementById("saveProfile");
const accountBtn = document.getElementById("accountBtn");


function ready() {
    return window.MARKHOR_CONFIG &&
        window.MARKHOR_CONFIG.supabaseUrl &&
        window.MARKHOR_CONFIG.supabasePublishableKey;
}


if (ready() && window.supabase) {

    client = window.supabase.createClient(
        window.MARKHOR_CONFIG.supabaseUrl,
        window.MARKHOR_CONFIG.supabasePublishableKey
    );

    client.auth.getSession().then(({ data }) => {
        handleSession(data.session);
    });

    client.auth.onAuthStateChange((event, session) => {
        handleSession(session);
    });

} else {

    status.textContent = "Supabase not configured.";

}


/* =========================
   SESSION
========================= */

async function handleSession(session) {

    if (session) {

        status.textContent =
            "Logged in as " + session.user.email;

        accountBtn.textContent = "LOGOUT";

        await loadProfile(session.user.id);

        showLoggedInInterface();

    } else {

        status.textContent =
            "You are currently signed out.";

        accountBtn.textContent = "LOGIN / SIGN UP";

        clearProfile();

        showLoggedOutInterface();

    }

}


/* =========================
   LOAD PROFILE
========================= */

async function loadProfile(userId) {

    if (!client) return;

    const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) {

        console.log("Profile load error:", error.message);

        return;

    }

    if (!data) return;

    usernameInput.value = data.username || "";
    fullNameInput.value = data.full_name || "";
    pubgUidInput.value = data.pubg_uid || "";
    countryInput.value = data.country || "Pakistan";

}


/* =========================
   CLEAR PROFILE
========================= */

function clearProfile() {

    usernameInput.value = "";
    fullNameInput.value = "";
    pubgUidInput.value = "";
    countryInput.value = "Pakistan";

}


/* =========================
   PROFILE INTERFACE
========================= */

function showLoggedInInterface() {

    document.querySelector(".account h2").textContent =
        "PLAYER PROFILE";

    document.querySelector(".account > div:first-child p").textContent =
        "Manage your Markhor Esports player identity.";

    document.querySelector(".accountbox h3").textContent =
        "MARKHOR PLAYER ID";

    saveProfileBtn.style.display = "block";

    fullNameInput.disabled = false;
    pubgUidInput.disabled = false;
    countryInput.disabled = false;

}


/* =========================
   LOGGED OUT INTERFACE
========================= */

function showLoggedOutInterface() {

    document.querySelector(".account h2").textContent =
        "YOUR ESPORTS ID";

    document.querySelector(".account > div:first-child p").textContent =
        "Login to create and manage your Markhor Esports player profile.";

    document.querySelector(".accountbox h3").textContent =
        "ACCOUNT";

    saveProfileBtn.style.display = "block";

}


/* =========================
   OPEN LOGIN
========================= */

function openModal() {

    modal.classList.add("show");

    msg.textContent = "";

}


/* =========================
   CLOSE LOGIN
========================= */

function closeModal() {

    modal.classList.remove("show");

}


document.getElementById("openLogin").onclick = openModal;


document.getElementById("close").onclick = closeModal;


modal.onclick = function (e) {

    if (e.target === modal) {

        closeModal();

    }

};


/* =========================
   LOGIN / LOGOUT BUTTON
========================= */

accountBtn.onclick = async function () {

    if (!client) {

        alert("Supabase is not configured.");

        return;

    }

    const { data } = await client.auth.getSession();

    if (data.session) {

        await client.auth.signOut();

    } else {

        openModal();

    }

};


/* =========================
   MOBILE MENU
========================= */

document.getElementById("menu").onclick = function () {

    document.getElementById("nav")
        .classList.toggle("open");

};


/* =========================
   REGISTER BUTTONS
========================= */

document.querySelectorAll(".registerBtn")
    .forEach(function (button) {

        button.onclick = function () {

            document.getElementById("account")
                .scrollIntoView({
                    behavior: "smooth"
                });

            openModal();

        };

    });


/* =========================
   LOGIN / SIGNUP TABS
========================= */

document.querySelectorAll(".tabs button")
    .forEach(function (button) {

        button.onclick = function () {

            document.querySelectorAll(".tabs button")
                .forEach(function (item) {

                    item.classList.remove("active");

                });

            button.classList.add("active");

            mode = button.dataset.mode;

            submit.textContent =
                mode === "login"
                    ? "LOGIN →"
                    : "CREATE ACCOUNT →";

            msg.textContent = "";

        };

    });


/* =========================
   LOGIN / SIGNUP
========================= */

document.getElementById("auth").onsubmit =
    async function (e) {

        e.preventDefault();

        if (!client) {

            msg.textContent =
                "Supabase is not configured.";

            return;

        }

        const email =
            document.getElementById("email")
                .value.trim();

        const password =
            document.getElementById("password")
                .value;

        msg.textContent =
            "Please wait...";


        let result;


        if (mode === "login") {

            result =
                await client.auth.signInWithPassword({
                    email: email,
                    password: password
                });

        } else {

            result =
                await client.auth.signUp({
                    email: email,
                    password: password
                });

        }


        if (result.error) {

            msg.textContent =
                result.error.message;

            return;

        }


        if (mode === "signup") {

            msg.textContent =
                "Account created successfully.";

        } else {

            msg.textContent =
                "Login successful.";

            setTimeout(function () {

                closeModal();

            }, 700);

        }

    };


/* =========================
   SAVE PROFILE
========================= */

saveProfileBtn.onclick = async function () {

    if (!client) {

        alert("Supabase is not configured.");

        return;

    }


    const { data } =
        await client.auth.getSession();


    if (!data.session) {

        alert("Please login first.");

        openModal();

        return;

    }


    const userId =
        data.session.user.id;


    const fullName =
        fullNameInput.value.trim();

    const pubgUid =
        pubgUidInput.value.trim();

    const country =
        countryInput.value.trim();


    saveProfileBtn.disabled = true;

    saveProfileBtn.textContent =
        "SAVING...";


    const { error } =
        await client
            .from("profiles")
            .update({

                full_name: fullName,

                pubg_uid: pubgUid,

                country: country

            })
            .eq("id", userId);


    saveProfileBtn.disabled = false;

    saveProfileBtn.textContent =
        "SAVE PROFILE";


    if (error) {

        alert(
            "Profile save error: " +
            error.message
        );

        console.log(error);

        return;

    }


    await loadProfile(userId);

    showLoggedInInterface();


    alert(
        "Profile saved successfully."
    );

};
