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


    client.auth.getSession()
    .then(({data}) => {
        loadSession(data.session);
    });


    client.auth.onAuthStateChange((event, session)=>{
        loadSession(session);
    });

}
else {

    status.textContent = "Supabase is not configured.";

}



async function loadSession(session){

    if(session){

        status.textContent =
        "Logged in as " + session.user.email;


        document.getElementById("accountBtn").textContent =
        "LOGOUT";


        await loadProfile(session.user.id);

    }

    else{

        status.textContent =
        "You are currently signed out.";

        document.getElementById("accountBtn").textContent =
        "LOGIN / SIGN UP";


        clearProfile();

    }

}



async function loadProfile(id){

    const {data,error} = await client
    .from("profiles")
    .select("*")
    .eq("id",id)
    .single();


    if(data){

        usernameInput.value =
        data.username || "";

        fullNameInput.value =
        data.full_name || "";

        pubgUidInput.value =
        data.pubg_uid || "";

        countryInput.value =
        data.country || "Pakistan";

    }

}



function clearProfile(){

    usernameInput.value="";
    fullNameInput.value="";
    pubgUidInput.value="";
    countryInput.value="Pakistan";

}



document.getElementById("openLogin").onclick = ()=>{
    modal.classList.add("show");
    msg.textContent="";
};



document.getElementById("close").onclick = ()=>{
    modal.classList.remove("show");
};



modal.onclick = (e)=>{

    if(e.target===modal){
        modal.classList.remove("show");
    }

};



document.getElementById("accountBtn").onclick = async ()=>{


    const {data}=await client.auth.getSession();


    if(data.session){

        await client.auth.signOut();

    }

    else{

        modal.classList.add("show");

    }

};



document.getElementById("menu").onclick = ()=>{

    document.getElementById("nav")
    .classList.toggle("open");

};



document.querySelectorAll(".registerBtn")
.forEach(btn=>{

    btn.onclick=()=>{

        document.getElementById("account")
        .scrollIntoView({
            behavior:"smooth"
        });

        modal.classList.add("show");

    };

});



document.querySelectorAll(".tabs button")
.forEach(btn=>{


    btn.onclick=()=>{


        document.querySelectorAll(".tabs button")
        .forEach(x=>x.classList.remove("active"));


        btn.classList.add("active");


        mode = btn.dataset.mode;


        submit.textContent =
        mode==="login"
        ? "LOGIN →"
        : "CREATE ACCOUNT →";


        msg.textContent="";


    };


});



document.getElementById("auth").onsubmit = async(e)=>{


    e.preventDefault();


    const email =
    document.getElementById("email")
    .value.trim();


    const password =
    document.getElementById("password")
    .value;



    msg.textContent="Please wait...";



    let result;



    if(mode==="login"){


        result =
        await client.auth.signInWithPassword({
            email,
            password
        });


    }

    else{


        result =
        await client.auth.signUp({
            email,
            password
        });


        if(!result.error && result.data.user){


            await client
            .from("profiles")
            .insert({

                id: result.data.user.id,

                username:
                email.split("@")[0],

                country:
                "Pakistan"

            });


        }


    }



    if(result.error){

        msg.textContent =
        result.error.message;

        return;

    }



    msg.textContent =
    mode==="login"
    ? "Login successful."
    : "Account created.";



};



saveProfileBtn.onclick = async()=>{


    const {data} =
    await client.auth.getSession();



    if(!data.session){

        alert("Please login first.");

        return;

    }



    const id =
    data.session.user.id;



    const {error} =
    await client
    .from("profiles")
    .update({

        full_name:
        fullNameInput.value,

        pubg_uid:
        pubgUidInput.value,

        country:
        countryInput.value

    })

    .eq("id",id);



    if(error){

        alert(error.message);

    }

    else{

        alert("Profile saved successfully.");

    if(saveProfileBtn){

saveProfileBtn.onclick = async()=>{

const {data}=await client.auth.getSession();

if(!data.session){
alert("Please login first");
return;
}

const userId=data.session.user.id;

const {error}=await client
.from("profiles")
.update({
full_name: document.getElementById("fullName").value,
pubg_uid: document.getElementById("pubgUid").value,
country: document.getElementById("country").value
})
.eq("id",userId);


if(error){
alert(error.message);
}
else{
alert("Profile saved successfully");
}

};

}
