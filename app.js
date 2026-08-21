let client = null;
let mode = "login";

const modal = document.getElementById("modal");
const msg = document.getElementById("message");
const status = document.getElementById("status");
const submit = document.getElementById("submit");

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
    session(data.session);
  });

  client.auth.onAuthStateChange((event, sessionData) => {
    session(sessionData);
  });

} else {
  status.textContent = "Supabase is not configured yet.";
}


function session(s) {
  if (s) {
    status.textContent = "Logged in as " + s.user.email;
    document.getElementById("accountBtn").textContent = "LOGOUT";
  } else {
    status.textContent = "You are currently signed out.";
    document.getElementById("accountBtn").textContent = "LOGIN / SIGN UP";
  }
}


function openModal() {
  modal.classList.add("show");
  msg.textContent = "";
}


function closeModal() {
  modal.classList.remove("show");
}


document.getElementById("openLogin").onclick = openModal;


document.getElementById("accountBtn").onclick = async () => {

  if (client) {
    const { data } = await client.auth.getSession();

    if (data.session) {
      await client.auth.signOut();
      return;
    }
  }

  openModal();
};


document.getElementById("close").onclick = closeModal;


modal.onclick = (e) => {
  if (e.target === modal) {
    closeModal();
  }
};


document.getElementById("menu").onclick = () => {
  document.getElementById("nav").classList.toggle("open");
};


document.querySelectorAll(".registerBtn").forEach(btn => {

  btn.onclick = () => {
    document.getElementById("account")
      .scrollIntoView({ behavior:"smooth" });

    openModal();
  };

});


document.querySelectorAll(".tabs button").forEach(btn => {

  btn.onclick = () => {

    document.querySelectorAll(".tabs button")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");

    mode = btn.dataset.mode;

    submit.textContent =
      mode === "login"
      ? "LOGIN →"
      : "CREATE ACCOUNT →";

    msg.textContent = "";
  };

});



document.getElementById("auth").onsubmit = async (e) => {

  e.preventDefault();


  if (!client) {
    msg.textContent = "Supabase not connected.";
    return;
  }


  const email =
    document.getElementById("email")
    .value.trim();

  const password =
    document.getElementById("password")
    .value;


  msg.textContent = "Please wait...";


  let result;


  if (mode === "login") {

    result =
      await client.auth.signInWithPassword({
        email,
        password
      });


  } else {


    result =
      await client.auth.signUp({
        email,
        password
      });


    if (!result.error && result.data.user) {


      const { error: profileError } =
        await client
        .from("profiles")
        .insert({

          id: result.data.user.id,

          username:
            email.split("@")[0],

          country:
            "Pakistan"

        });


      if (profileError) {

        console.log(profileError);

      }

    }

  }



  if (result.error) {

    msg.textContent =
      result.error.message;

    return;

  }


  msg.textContent =
    mode === "login"
    ? "Login successful."
    : "Account created successfully.";


  if(mode === "login"){
    setTimeout(closeModal,700);
  }

};
