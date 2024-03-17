let currentSong = new Audio();
let songs;
let currentFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    // console.log(as);
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUl = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUl.innerHTML = "";

    //show all the songs in the playlist
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
                            <li>
                                <img class="invert" src="/img/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Satyam</div>
                                </div>
                                <div class="playNow">
                                    <span>Play Now</span>
                                    <img class="invert" src="/img/playNow.svg" alt="">
                                </div>
                            </li>`;
    }

    //Attach the event listeners to each songs
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", (element) => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    // Attach the event listeners to the play, next, and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "/img/play-google.svg";
        }
    })

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "/img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function main() {

    //get the list of the songs
    await getSongs("songs/90's-Songs");
    playMusic(songs[0], true);

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add a event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e);
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous clicked")
        let songName = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(songName);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        console.log("Next clicked")
        currentSong.pause();
        let songName = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(songName);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })


    // add a event listener to the volume img element
    let volume = document.querySelector('.volume').getElementsByTagName('img')[0];
    volume.addEventListener("click", () => {
        if (currentSong.muted) {
            currentSong.muted = false;
            volume.src = '/img/volume.svg';
            console.log("unmute");
        }
        else {
            currentSong.muted = true;
            volume.src = '/img/mute.svg';
            console.log("mute")
        }
    })

    // add a event listener to the volume slider
    let volumeSlider = document.querySelector('.volume').getElementsByTagName('input')[0];
    volumeSlider.addEventListener("change", () => {
        currentSong.volume = volumeSlider.value / 100;
    })

    // Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })

}

main();
