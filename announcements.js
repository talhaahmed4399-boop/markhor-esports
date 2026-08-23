console.log("PUBLIC ANNOUNCEMENTS LOADED");


async function loadPublicAnnouncements(){

    const box =
        document.getElementById(
            "publicAnnouncements"
        );


    if(!box){
        return;
    }


    const {
        data,
        error
    } =
    await window.supabase
    .createClient(
        window.MARKHOR_CONFIG.supabaseUrl,
        window.MARKHOR_CONFIG.supabasePublishableKey
    )
    .from("announcements")
    .select("*")
    .eq(
        "published",
        true
    )
    .order(
        "created_at",
        {
            ascending:false
        }
    );


    if(error){

        console.error(
            "ANNOUNCEMENT ERROR",
            error
        );

        box.innerHTML =
        "FAILED TO LOAD ANNOUNCEMENTS";

        return;
    }



    if(!data.length){

        box.innerHTML =
        "NO ANNOUNCEMENTS";

        return;
    }



    box.innerHTML="";


    data.forEach(
        announcement=>{


        box.innerHTML +=

        `
        <article class="announcement-card">

            <div class="body">

                <small>
                MARKHOR ESPORTS
                </small>


                <h3>
                ${announcement.title}
                </h3>


                <p>
                ${announcement.content}
                </p>


            </div>

        </article>
        `;


        }
    );

}


loadPublicAnnouncements();
