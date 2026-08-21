let client = null;
let mode = "login";

const modal = document.getElementById("modal");
const msg = document.getElementById("message");
const status = document.getElementById("status");
const submit = document.getElementById("submit");


function ready(){
    return window.MARKHOR_CONFIG &&
    window.MARKHOR_CONFIG.supabaseUrl &&
    window.MARKHOR_CONFIG.supabasePublishableKey;
}


if(ready() && window.supabase){

    client = window.supabase.createClient(
        window.MARKHOR_CONFIG.supabaseUrl,
        window.MARKHOR_CONFIG.supabasePublishableKey
    );


    client.auth.getSession()
    .then(({data})=>{
        updateSession(data.session);
    });


    client.auth.onAuthStateChange((event,session)=>{
        updateSession(session);
    });

}
else{

    status.textContent="Supabase not configured.";

}



function updateSession(session){

    if(session){

        status.textContent =
        "Logged in as " + session.user.email;

        document.getElementById("accountBtn").textContent="LOGOUT";

    }

    else{

        status.textContent =
        "You are currently signed out.";

        document.getElementById("accountBtn").textContent="LOGIN / SIGN UP";

    }

}



function openModal(){

    modal.classList.add("show");
    msg.textContent="";

}


function closeModal(){

    modal.classList.remove("show");

}



document.getElementById("openLogin").onclick=openModal;


document.getElementById("close").onclick=closeModal;


modal.onclick=(e)=>{

    if(e.target===modal){
        closeModal();
    }

};



document.getElementById("accountBtn").onclick=async()=>{

    const {data}=await client.auth.getSession();


    if(data.session){

        await client.auth.signOut();

    }

    else{

        openModal();

    }

};



document.getElementById("menu").onclick=()=>{

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

        openModal();

    };

});



document.querySelectorAll(".tabs button")
.forEach(btn=>{

    btn.onclick=()=>{

        document.querySelectorAll(".tabs button")
        .forEach(x=>x.classList.remove("active"));


        btn.classList.add("active");


        mode=btn.dataset.mode;


        submit.textContent =
        mode==="login"
        ?"LOGIN →"
        :"CREATE ACCOUNT →";


        msg.textContent="";

    };

});



document.getElementById("auth").onsubmit=async(e)=>{

    e.preventDefault();


    const email=
    document.getElementById("email")
    .value.trim();


    const password=
    document.getElementById("password")
    .value;


    msg.textContent="Please wait...";


    let result;


    if(mode==="login"){


        result=
        await client.auth.signInWithPassword({
            email,
            password
        });


    }
    else{


        result=
        await client.auth.signUp({
            email,
            password
        });


    }



    if(result.error){

        msg.textContent=result.error.message;

        return;

    }



    msg.textContent =
    mode==="login"
    ?"Login successful."
    :"Account created successfully.";


    if(mode==="login"){

        setTimeout(closeModal,800);
const saveProfileBtn = document.getElementById("saveProfile");
        
console.log("Save profile loaded");
        
if(saveProfileBtn){

saveProfileBtn.onclick = async()=>{

    const {data} = await client.auth.getSession();

    if(!data.session){

        alert("Please login first");
        return;

    }


    const userId = data.session.user.id;


    const {error} = await client
    .from("profiles")
    .update({

        full_name: document.getElementById("fullName").value,

        pubg_uid: document.getElementById("pubgUid").value,

        country: document.getElementById("country").value

    })
    .eq("id", userId);



    if(error){

        alert(error.message);

    }
    else{

        alert("Profile saved successfully");

    }

};

}
    }


};
