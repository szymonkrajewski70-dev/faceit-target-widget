const API_BASE =
    "https://faceit-target-api.szymonkrajewski70.workers.dev";

const ME = "-krajewsky-";
const DEFAULT_TARGET = "-TOBOL-";


// =========================
// API
// =========================

async function getPlayer(nickname) {

    const response = await fetch(
        `${API_BASE}/?nickname=${encodeURIComponent(nickname)}`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `FACEIT API error: ${response.status}`
        );
    }

    return data;
}


// =========================
// HELPERS
// =========================

function getElement(id) {
    return document.getElementById(id);    
}


function countryFlag(country) {

    if (!country) {
        return "";
    }

    const code = country.toUpperCase();

    if (code.length !== 2) {
        return country;
    }

    return String.fromCodePoint(
        ...[...code].map(
            char => 127397 + char.charCodeAt(0)
        )
    );
}


function formatCountry(country) {
    if (!country) return "";

    const code = country.toLowerCase();
    return `
        <img
            src="https://flagcdn.com/w40/${code}.png"
            alt="${country.toUpperCase()}"
            class="country-flag"
        >
    `;
}

// =========================
// AVATAR
// =========================

function setAvatar(elementId, avatar, nickname) {
    const imageElement = getElement(elementId);
    if (!imageElement) return;

    let imageUrl = avatar;

    if (nickname === "-krajewsky-") {
        imageUrl =
            "https://distribution.faceit-cdn.net/images/ee7c7d24-f0b0-46c0-be3d-ab7bf505a751.jpg";
    }

    if (!imageUrl) {
        imageElement.removeAttribute("src");
        imageElement.alt =
            nickname.charAt(0).toUpperCase();
        return;
    }

    imageElement.alt = `${nickname} avatar`;

    imageElement.onerror = () => {
        imageElement.removeAttribute("src");
        imageElement.alt =
            nickname.charAt(0).toUpperCase();
    };

    imageElement.src =
        `${API_BASE}/avatar?url=${encodeURIComponent(imageUrl)}`;
}
// =========================
// MY PROFILE
// =========================

function renderMyProfile(player) {

    getElement("myNickname").textContent =
        player.nickname || ME;

    getElement("myCountry").innerHTML =
        formatCountry(player.country);

    getElement("myLevel").textContent =
        player.level ?? "-";

    getElement("myElo").textContent =
        player.elo != null
            ? Number(player.elo).toLocaleString("en-US")
            : "-";

    setAvatar(
        "myAvatar",
        player.avatar,
        player.nickname || ME
    );


    // Statistics

    const stats = player.stats || {};

    getElement("wins").textContent =
        stats.wins != null
            ? `${stats.wins}%`
            : "-";

    getElement("matches").textContent =
        stats.matches != null
            ? Number(stats.matches).toLocaleString("en-US")
            : "-";

    getElement("kd").textContent =
        stats.kd != null
            ? stats.kd
            : "-";


    renderRecentForm(
        stats.recentResults || []
    );
}


// =========================
// TARGET
// =========================

function renderTarget(player) {

    getElement("targetNickname").textContent =
        player.nickname || "-";

    getElement("targetCountry").innerHTML =
        formatCountry(player.country);

    getElement("targetLevel").textContent =
        player.level ?? "-";

    getElement("targetElo").textContent =
        player.elo != null
            ? Number(player.elo).toLocaleString("en-US")
            : "-";

    setAvatar(
        "targetAvatar",
        player.avatar,
        player.nickname || "T"
    );

    updateEloProgress();
    updateFooter();
}


// =========================
// RECENT FORM
// =========================

function renderRecentForm(results) {

    const form = getElement("form");

    if (!form) {
        return;
    }

    if (!results.length) {
        form.textContent = "-";
        return;
    }

    form.innerHTML = "";

    results.slice(0, 5).forEach(result => {

        const item = document.createElement("span");

        /*
         * FACEIT zwraca wyniki jako wartości liczbowe.
         * 0 traktujemy jako L.
         * Pozostałe wartości z aktualnych danych jako W.
         */

        if (Number(result) === 0) {

            item.textContent = "L";
            item.className = "form-loss";

        } else {

            item.textContent = "W";
            item.className = "form-win";

        }

        form.appendChild(item);

    });
}


// =========================
// ELO PROGRESS
// =========================

function updateEloProgress() {

    const myElo =
        Number(
            getElement("myElo").textContent.replace(/,/g, "")
        );

    const targetElo =
        Number(
            getElement("targetElo").textContent.replace(/,/g, "")
        );

    if (
        !Number.isFinite(myElo) ||
        !Number.isFinite(targetElo)
    ) {
        return;
    }


    const difference =
        myElo - targetElo;


    getElement("difference").textContent =
        `${difference >= 0 ? "+" : ""}${difference} ELO`;


    const highest =
        Math.max(myElo, targetElo);

    const lowest =
        Math.min(myElo, targetElo);


    let progress;

    if (highest === lowest) {

        progress = 50;

    } else {

        progress =
            ((myElo - lowest) /
            (highest - lowest)) * 100;

    }


    progress =
        Math.max(
            10,
            Math.min(90, progress)
        );


    getElement("progressBar").style.width =
        `${progress}%`;
}


// =========================
// FOOTER
// =========================

function updateFooter() {

    const myNickname =
        getElement("myNickname").textContent;

    const targetNickname =
        getElement("targetNickname").textContent;

    getElement("footerPlayers").textContent =
        `${myNickname} vs ${targetNickname}`;
}


// =========================
// LOAD PLAYERS
// =========================

async function loadPlayers(targetNickname) {

    try {

        const myPlayer =
            await getPlayer(ME);

        const targetPlayer =
            await getPlayer(targetNickname);

        renderMyProfile(myPlayer);
        renderTarget(targetPlayer);

    } catch (error) {

        console.error(error);

        alert(
            `Nie udało się pobrać danych gracza.\n\n${error.message}`
        );

    }
}


// =========================
// SEARCH
// =========================

async function searchTarget() {

    const input =
        getElement("targetInput");

    const button =
        getElement("searchButton");

    const nickname =
        input.value.trim();

    if (!nickname) {

        alert("Wpisz nick gracza FACEIT.");

        input.focus();

        return;
    }


    button.disabled = true;
    button.textContent = "LOADING...";


    try {

        const myPlayer =
            await getPlayer(ME);

        const targetPlayer =
            await getPlayer(nickname);

        renderMyProfile(myPlayer);
        renderTarget(targetPlayer);

        input.value =
            targetPlayer.nickname || nickname;

    } catch (error) {

        console.error(error);

        alert(
            `Nie znaleziono gracza lub wystąpił błąd.\n\n${error.message}`
        );

    } finally {

        button.disabled = false;
        button.textContent = "SEARCH";

    }
}


// =========================
// EVENTS
// =========================

getElement("searchButton")
    .addEventListener(
        "click",
        searchTarget
    );


getElement("targetInput")
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                searchTarget();
            }

        }
    );


// =========================
// START
// =========================

loadPlayers(DEFAULT_TARGET);    
