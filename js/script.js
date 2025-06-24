console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;

    let response = await fetch(`${folder}/info.json`);
    let data = await response.json();
    songs = data.songs;

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Ayush</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Event listener to each song
    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").innerText.trim());
        });
    });

    return songs;
}

function playMusic(track, pause = false) {
    currentSong.src = `${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("displaying albums");

    // Replace with manual list if not using albums.json
    const folders = [
        "songs/Lovesong",
        "songs/ed sheeran",
        "songs/karan_aujla",
        "songs/rap",
        "songs/hindisong",
        "songs/Dark_(mood)",
        "songs/Funky_(mood)",
        "songs/Uplifting_(mood)"
    ];

    let cardContainer = document.querySelector(".cardContainer");
    for (let folder of folders) {
        try {
            let res = await fetch(`${folder}/info.json`);
            let info = await res.json();
            let folderName = folder.split("/").pop();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="${folder}/cover.jpg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
        } catch (err) {
            console.warn(`Could not load info.json for ${folder}`);
        }
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getSongs(card.dataset.folder);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/Lovesong");
    playMusic(songs[0], true);
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        document.querySelector(".volume>img").src = currentSong.volume > 0 ?
            "img/volume.svg" : "img/mute.svg";
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
