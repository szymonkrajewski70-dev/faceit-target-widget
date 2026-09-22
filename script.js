const API_BASE =
    "https://faceit-target-api.szymonkrajewski70.workers.dev";
const params =
    new URLSearchParams(
        window.location.search
    );
const obsMode =
    params.get("obs") === "1";
const requestedMe =
    params.get("me")?.trim();

const ME =
    requestedMe || "-krajewsky-";

const DEFAULT_TARGET =
    params.get("target")?.trim() ||
    (
        ME.toLowerCase() ===
        "-tobol-".toLowerCase()
            ? "-krajewsky-"
            : "-TOBOL-"
    );

/* =========================
   HELPERS
========================= */

function $(id) {
    return document.getElementById(id);
}

function safeText(value, fallback = "—") {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return fallback;
    }

    return String(value);
}

function formatNumber(value, decimals = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toFixed(decimals);
}

function formatSigned(value, decimals = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    if (number > 0) {
        return `+${number.toFixed(decimals)}`;
    }

    return number.toFixed(decimals);
}

/* =========================
   COUNTRY / FLAG
========================= */

function formatCountry(country) {
    if (!country) {
        return "";
    }

    const code =
        String(country).toLowerCase();

    return `
        <img
            src="https://flagcdn.com/w40/${code}.png"
            alt="${code.toUpperCase()}"
            class="country-flag"
        >
    `;
}


/* =========================
   FACEIT RANK BADGES
========================= */

function getFaceitRankImage(level) {
    const rankImages = {
    1: "https://support.faceit.com/hc/article_attachments/10525200575516",
    2: "https://support.faceit.com/hc/article_attachments/10525189649308",
    3: "https://support.faceit.com/hc/article_attachments/10525200576796",
    4: "https://support.faceit.com/hc/article_attachments/10525185037724",
    5: "https://support.faceit.com/hc/article_attachments/10525215800860",
    6: "https://support.faceit.com/hc/article_attachments/10525245409692",
    7: "https://support.faceit.com/hc/article_attachments/10525185034012",
    8: "https://support.faceit.com/hc/article_attachments/10525189648796",
    9: "https://support.faceit.com/hc/article_attachments/10525200576028",
    10: "https://support.faceit.com/hc/article_attachments/10525189646876"
};

    return (
        rankImages[
            Number(level)
        ] || null
    );
}

/* =========================
   API
========================= */

async function getPlayer(nickname) {
    const url =
        `${API_BASE}/?nickname=${encodeURIComponent(
            nickname
        )}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `API error: ${response.status}`
        );
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(
            data.message || data.error
        );
    }

    return data;
}

/* =========================
   AVATAR
========================= */

function setAvatar(element, avatarUrl, nickname) {
    if (!element) {
        return;
    }

    if (!avatarUrl) {
        element.removeAttribute("src");
        return;
    }

    const proxyUrl =
        `${API_BASE}/avatar?url=${encodeURIComponent(
            avatarUrl
        )}`;

    element.src = proxyUrl;
    element.alt = nickname || "Avatar";

    element.onerror = () => {
        element.src = avatarUrl;
    };
}

/* =========================
   ELO 24H
========================= */

function formatElo24h(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    if (number > 0) {
        return `+${number}`;
    }

    return String(number);
}

function elo24hClass(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "";
    }

    if (number > 0) {
        return "positive";
    }

    if (number < 0) {
        return "negative";
    }

    return "neutral";
}

/* =========================
   RECENT FORM
========================= */

function renderRecentForm(
    form,
    container
) {
    if (!container) {
        return;
    }

    if (!Array.isArray(form) || !form.length) {
        container.innerHTML =
            `<span class="form-empty">—</span>`;
        return;
    }

    container.innerHTML = form
        .slice(0, 5)
        .map(result => {
            const value =
                String(result).toUpperCase();

            const isWin = value === "W";

            return `
                <span
                    class="form-result ${
                        isWin
                            ? "win"
                            : "loss"
                    }"
                >
                    ${isWin ? "W" : "L"}
                </span>
            `;
        })
        .join("");
}

/* =========================
   RECENT STATS
========================= */

function getRecent(player) {
    return player?.recent || {
        matches: 0,
        wins: 0,
        losses: 0,
        kills: null,
        deaths: null,
        kd: null,
        headshots: null,
        form: [],
        lastMatch: null
    };
}

function recentWinRate(recent) {
    const wins = Number(recent?.wins);
    const matches = Number(recent?.matches);

    if (
        !Number.isFinite(wins) ||
        !Number.isFinite(matches) ||
        matches <= 0
    ) {
        return null;
    }

    return (wins / matches) * 100;
}

function recentSummary(recent) {
    const wins = Number(recent?.wins);
    const losses = Number(recent?.losses);

    return {
        wins: Number.isFinite(wins)
            ? wins
            : 0,

        losses: Number.isFinite(losses)
            ? losses
            : 0
    };
}

/* =========================
   PLAYER DATA
========================= */

function getLifetimeWinRate(player) {
    const value =
        player?.stats?.wins;

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function getLifetimeMatches(player) {
    const value =
        player?.stats?.matches;

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function getLifetimeKd(player) {
    const value =
        player?.stats?.kd;

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

/* =========================
   OLD / EXISTING WIDGET
   SUPPORT
========================= */

function renderMyProfile(player) {
    if (!player) {
        return;
    }

    if ($("myNickname")) {
        $("myNickname").textContent =
            safeText(player.nickname);
    }

    if ($("myCountry")) {
        $("myCountry").innerHTML =
            formatCountry(player.country);
    }

    if ($("myLevel")) {
        $("myLevel").textContent =
            safeText(player.level);
    }

    if ($("myElo")) {
        $("myElo").textContent =
            safeText(player.elo);
    }

    if ($("myAvatar")) {
        setAvatar(
            $("myAvatar"),
            player.avatar,
            player.nickname
        );
    }

    if ($("wins")) {
        $("wins").textContent =
            getLifetimeWinRate(player) !== null
                ? `${formatNumber(
                    getLifetimeWinRate(player),
                    0
                )}%`
                : "—";
    }

    if ($("matches")) {
        $("matches").textContent =
            safeText(
                getLifetimeMatches(player)
            );
    }

    if ($("kd")) {
        $("kd").textContent =
            getLifetimeKd(player) !== null
                ? formatNumber(
                    getLifetimeKd(player),
                    2
                )
                : "—";
    }

    if ($("form")) {
        renderRecentForm(
            player?.stats?.recentResults,
            $("form")
        );
    }
}

function renderTarget(player) {
    if (!player) {
        return;
    }

    if ($("targetNickname")) {
        $("targetNickname").textContent =
            safeText(player.nickname);
    }

    if ($("targetCountry")) {
        $("targetCountry").innerHTML =
            formatCountry(player.country);
    }

    if ($("targetLevel")) {
        $("targetLevel").textContent =
            safeText(player.level);
    }

    if ($("targetElo")) {
        $("targetElo").textContent =
            safeText(player.elo);
    }

    if ($("targetAvatar")) {
        setAvatar(
            $("targetAvatar"),
            player.avatar,
            player.nickname
        );
    }
}

/* =========================
   NEW PLAYER ROW
========================= */

function renderPlayerRow(
    prefix,
    player
) {
    if (!player) {
        return;
    }

    const recent =
        getRecent(player);

    const summary =
        recentSummary(recent);

    const lifetimeWinRate =
        getLifetimeWinRate(player);

    const lifetimeMatches =
        getLifetimeMatches(player);

    const lifetimeKd =
        getLifetimeKd(player);

    const recentKd =
        recent.kd !== null
            ? Number(recent.kd)
            : null;

    const rawRecentHs =
        recent.headshots !== null
            ? Number(recent.headshots)
            : null;

    const recentHs =
        Number.isFinite(rawRecentHs) &&
        rawRecentHs >= 0 &&
        rawRecentHs <= 100
            ? rawRecentHs
            : null;

    const elo =
        Number(player.elo);

    const elo24h =
        player.elo24h;

    /* Avatar */

    const avatar =
        $(`${prefix}Avatar`);

    if (avatar) {
        setAvatar(
            avatar,
            player.avatar,
            player.nickname
        );
    }

    /* Nickname */

    const nickname =
        $(`${prefix}Nickname`);

    if (nickname) {
        nickname.textContent =
            safeText(player.nickname);
    }

    /* Country */

    const country =
        $(`${prefix}Country`);

    if (country) {
        country.innerHTML =
            formatCountry(player.country);
    }

    /* Level */

    const level =
        $(`${prefix}Level`);

    const levelNumber =
        Number(player.level);

    if (level) {
        level.textContent =
            Number.isFinite(levelNumber)
                ? String(levelNumber)
                : "—";
    }

    const levelText =
        $(`${prefix}LevelText`);

    if (levelText) {
        levelText.textContent =
            Number.isFinite(levelNumber)
                ? String(levelNumber)
                : "—";
    }

    const row =
        prefix === "my"
            ? $("myPlayerRow")
            : $("targetPlayerRow");

    const levelRing =
        row?.querySelector(
            ".level-ring"
        );

    const rankImage =
        getFaceitRankImage(
            levelNumber
        );

    if (
        levelRing &&
        rankImage
    ) {
        levelRing.innerHTML = `
            <div class="level-number">
                <img
                    src="${rankImage}"
                    alt="FACEIT Level ${levelNumber}"
                    class="faceit-rank-image"
                >
            </div>
        `;
    }

    /* ELO */

    const eloElement =
        $(`${prefix}Elo`);

    if (eloElement) {
        eloElement.textContent =
            Number.isFinite(elo)
                ? String(elo)
                : "—";
    }

    /* 24H ELO */

    const elo24hElement =
        $(`${prefix}Elo24h`);

    if (elo24hElement) {
        elo24hElement.textContent =
            formatElo24h(elo24h);

        elo24hElement.classList.remove(
            "positive",
            "negative",
            "neutral"
        );

        const className =
            elo24hClass(elo24h);

        if (className) {
            elo24hElement.classList.add(
                className
            );
        }
    }

    /* Matches */

    const matchesElement =
        $(`${prefix}Matches`);

    if (matchesElement) {
        matchesElement.textContent =
            lifetimeMatches !== null
                ? String(lifetimeMatches)
                : "—";
    }

    /* Lifetime Win Rate */

    const winsElement =
        $(`${prefix}Wins`);

    if (winsElement) {
        winsElement.textContent =
            lifetimeWinRate !== null
                ? `${formatNumber(
                    lifetimeWinRate,
                    0
                )}%`
                : "—";
    }

    /* Lifetime K/D */

    const kdElement =
        $(`${prefix}Kd`);

    if (kdElement) {
        kdElement.textContent =
            lifetimeKd !== null
                ? formatNumber(
                    lifetimeKd,
                    2
                )
                : "—";
    }

    /* Recent K/D */

    const recentKdElement =
        $(`${prefix}RecentKd`);

    if (recentKdElement) {
        recentKdElement.textContent =
            recentKd !== null
                ? formatNumber(
                    recentKd,
                    2
                )
                : "—";
    }

    /* Recent kills */

    const killsElement =
        $(`${prefix}Kills`);

    if (killsElement) {
        killsElement.textContent =
            recent.kills !== null
                ? String(recent.kills)
                : "—";
    }

    /* Recent deaths */

    const deathsElement =
        $(`${prefix}Deaths`);

    if (deathsElement) {
        deathsElement.textContent =
            recent.deaths !== null
                ? String(recent.deaths)
                : "—";
    }

    /* Recent headshots */

    const headshotsElement =
        $(`${prefix}Headshots`);

    if (headshotsElement) {
        headshotsElement.textContent =
            recentHs !== null
                ? `${formatNumber(
                    recentHs,
                    0
                )}%`
                : "—";
    }

    /* Recent matches */

    const recentMatchesElement =
        $(`${prefix}RecentMatches`);

    if (recentMatchesElement) {
        recentMatchesElement.textContent =
            String(recent.matches || 0);
    }

    /* Recent wins */

    const recentWinsElement =
        $(`${prefix}RecentWins`);

    if (recentWinsElement) {
        recentWinsElement.textContent =
            String(summary.wins);
    }

    /* Recent losses */

    const recentLossesElement =
        $(`${prefix}RecentLosses`);

    if (recentLossesElement) {
        recentLossesElement.textContent =
            String(summary.losses);
    }

    /* Recent win rate */

    const recentWinRateElement =
        $(`${prefix}RecentWinRate`);

    if (recentWinRateElement) {
        const rate =
            recentWinRate(recent);

        recentWinRateElement.textContent =
            rate !== null
                ? `${formatNumber(
                    rate,
                    0
                )}%`
                : "—";
    }

    /* Form */

    const formElement =
        $(`${prefix}Form`);

    if (formElement) {
        renderRecentForm(
            recent.form,
            formElement
        );
    }

    /* Last match */

    const lastMatch =
        recent.lastMatch;

    if (lastMatch) {
        const lastKills =
            $(`${prefix}LastKills`);

        if (lastKills) {
            lastKills.textContent =
                lastMatch.kills !== null
                    ? String(
                        lastMatch.kills
                    )
                    : "—";
        }

        const lastDeaths =
            $(`${prefix}LastDeaths`);

        if (lastDeaths) {
            lastDeaths.textContent =
                lastMatch.deaths !== null
                    ? String(
                        lastMatch.deaths
                    )
                    : "—";
        }

        const lastKd =
            $(`${prefix}LastKd`);

        if (lastKd) {
            lastKd.textContent =
                lastMatch.kd !== null
                    ? formatNumber(
                        lastMatch.kd,
                        2
                    )
                    : "—";
        }

        const lastHs =
            $(`${prefix}LastHeadshots`);

        if (lastHs) {
            lastHs.textContent =
                lastMatch.headshots !== null
                    ? `${formatNumber(
                        lastMatch.headshots,
                        0
                    )}%`
                    : "—";
        }
    }
}

/* =========================
   COMPARISON
========================= */

function renderComparison(
    myPlayer,
    targetPlayer
) {
    if (
        !myPlayer ||
        !targetPlayer
    ) {
        return;
    }

    const myElo =
        Number(myPlayer.elo);

    const targetElo =
        Number(targetPlayer.elo);

    /*
        RÓŻNICA ELO:
        moje ELO - ELO przeciwnika

        Przykład:
        1051 - 1942 = -891
    */

    const eloDifference =
        Number.isFinite(myElo) &&
        Number.isFinite(targetElo)
            ? myElo - targetElo
            : null;

    /*
        ILE BRAKUJE DO PRZECIWNIKA

        Jeżeli przeciwnik ma więcej ELO,
        pokazujemy różnicę.

        Jeżeli mam tyle samo albo więcej,
        pokazujemy 0.
    */

    const eloMissing =
        Number.isFinite(myElo) &&
        Number.isFinite(targetElo)
            ? Math.max(
                0,
                targetElo - myElo
            )
            : null;


    /* =========================
       WIN RATE
    ========================== */

    const myWinRate =
        getLifetimeWinRate(
            myPlayer
        );

    const targetWinRate =
        getLifetimeWinRate(
            targetPlayer
        );

    const winRateDifference =
        myWinRate !== null &&
        targetWinRate !== null
            ? myWinRate -
              targetWinRate
            : null;


    /* =========================
       K/D
    ========================== */

    const myKd =
        getLifetimeKd(
            myPlayer
        );

    const targetKd =
        getLifetimeKd(
            targetPlayer
        );

    const kdDifference =
        myKd !== null &&
        targetKd !== null
            ? myKd -
              targetKd
            : null;


    /* =========================
       ELO DIFFERENCE
    ========================== */

    const eloElement =
        $("comparisonElo");

    if (eloElement) {
        eloElement.textContent =
            eloDifference !== null
                ? formatSigned(
                    eloDifference
                )
                : "—";
    }


    /* =========================
       ELO MISSING TEXT
    ========================== */

    const missingText =
        $("eloMissingText");

    if (missingText) {
        missingText.textContent =
            eloMissing !== null
                ? `${eloMissing} brakuje do przeciwnika`
                : "—";
    }


    /* =========================
       WIN RATE DIFFERENCE
    ========================== */

    const winRateElement =
        $("comparisonWinRate");

    if (winRateElement) {
        winRateElement.textContent =
            winRateDifference !== null
                ? `${formatSigned(
                    winRateDifference,
                    0
                )}%`
                : "—";
    }


    /* =========================
       K/D DIFFERENCE
    ========================== */

    const kdElement =
        $("comparisonKd");

    if (kdElement) {
        kdElement.textContent =
            kdDifference !== null
                ? formatSigned(
                    kdDifference,
                    2
                )
                : "—";
    }


    /* =========================
       MY MATCHES
    ========================== */

    const myMatchesElement =
        $("comparisonMyMatches");

    if (myMatchesElement) {
        const matches =
            getLifetimeMatches(
                myPlayer
            );

        myMatchesElement.textContent =
            matches !== null
                ? String(matches)
                : "—";
    }


    /* =========================
       TARGET MATCHES
    ========================== */

    const targetMatchesElement =
        $("comparisonTargetMatches");

    if (targetMatchesElement) {
        const matches =
            getLifetimeMatches(
                targetPlayer
            );

        targetMatchesElement.textContent =
            matches !== null
                ? String(matches)
                : "—";
    }
}

/* =========================
   OLD ELO BAR
========================= */

function updateEloProgress(
    myElo,
    targetElo
) {
    const my =
        Number(myElo);

    const target =
        Number(targetElo);

    if (
        !Number.isFinite(my) ||
        !Number.isFinite(target)
    ) {
        return;
    }

    const difference =
        my - target;

    if ($("difference")) {
        $("difference").textContent =
            difference >= 0
                ? `+${difference}`
                : String(difference);
    }

    const progressBar =
        $("progressBar");

    if (progressBar) {
        const total =
            Math.abs(my) +
            Math.abs(target);

        let percent = 50;

        if (total > 0) {
            percent =
                (my / total) * 100;
        }

        percent =
            Math.max(
                5,
                Math.min(
                    95,
                    percent
                )
            );

        progressBar.style.width =
            `${percent}%`;
    }
}

/* =========================
   FOOTER
========================= */

function updateFooter(
    myPlayer,
    targetPlayer
) {
    const footer =
        $("footerPlayers");

    if (!footer) {
        return;
    }

    footer.textContent =
        `${safeText(
            myPlayer?.nickname
        )} vs ${safeText(
            targetPlayer?.nickname
        )}`;
}

/* =========================
   RENDER EVERYTHING
========================= */

function renderWidget(
    myPlayer,
    targetPlayer
) {
    /* Old layout */

    renderMyProfile(
        myPlayer
    );

    renderTarget(
        targetPlayer
    );

    updateEloProgress(
        myPlayer?.elo,
        targetPlayer?.elo
    );

    updateFooter(
        myPlayer,
        targetPlayer
    );

    /* New layout */

    renderPlayerRow(
        "my",
        myPlayer
    );

    renderPlayerRow(
        "target",
        targetPlayer
    );

    renderComparison(
        myPlayer,
        targetPlayer
    );

    /* Store current players */

    window.currentMyPlayer =
        myPlayer;

    window.currentTargetPlayer =
        targetPlayer;
}

/* =========================
   LOAD PLAYERS
========================= */

async function loadPlayers(
    targetNickname = DEFAULT_TARGET
) {
    try {
        const myPlayer =
            await getPlayer(ME);

        const targetPlayer =
            await getPlayer(
                targetNickname
            );

        renderWidget(
            myPlayer,
            targetPlayer
        );

        return {
            myPlayer,
            targetPlayer
        };
    } catch (error) {
        console.error(
            "FACEIT widget error:",
            error
        );

        if ($("status")) {
            $("status").textContent =
                "API ERROR";
        }

        if ($("apiStatus")) {
            $("apiStatus").textContent =
                "API OFFLINE";
        }

        if ($("error")) {
            $("error").textContent =
                error.message;
        }

        throw error;
    }
}

/* =========================
   SEARCH
========================= */

async function searchTarget() {
    const input =
        $("targetInput");

    if (!input) {
        return;
    }

    const nickname =
        input.value.trim();

    if (!nickname) {
        return;
    }

    const button =
        $("searchButton");

    if (button) {
        button.disabled = true;
        button.textContent =
            "SZUKANIE...";
    }

    try {
        await loadPlayers(
            nickname
        );
    } catch (error) {
        console.error(error);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent =
                "SZUKAJ";
        }
    }
}

/* =========================
   SEARCH EVENTS
========================= */

function setupSearch() {
    const button =
        $("searchButton");

    const input =
        $("targetInput");

    if (button) {
        button.addEventListener(
            "click",
            searchTarget
        );
    }

    if (input) {
        input.addEventListener(
            "keydown",
            event => {
                if (
                    event.key ===
                    "Enter"
                ) {
                    searchTarget();
                }
            }
        );
    }
}

/* =========================
   INIT
========================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        if (obsMode) {
    document.body.classList.add(
        "obs-mode"
    );
}
        setupSearch();

        try {
            await loadPlayers(
                DEFAULT_TARGET
            );
        } catch (error) {
            console.error(error);
        }
    }
);
/* =========================
   AUTO REFRESH
========================= */

let autoRefreshRunning = false;

setInterval(async () => {
    if (autoRefreshRunning) {
        return;
    }

    autoRefreshRunning = true;

    try {
        const currentTarget =
            window.currentTargetPlayer?.nickname ||
            DEFAULT_TARGET;

        await loadPlayers(
            currentTarget
        );
    } catch (error) {
        console.error(
            "Auto refresh error:",
            error
        );
    } finally {
        autoRefreshRunning = false;
    }
}, 10 * 60 * 1000);
/* =========================
   FACEIT WEBHOOK WATCHER
========================= */

let lastWebhookTimestamp = null;
let webhookCheckRunning = false;

async function checkWebhookStatus() {
    if (webhookCheckRunning) {
        return;
    }

    webhookCheckRunning = true;

    try {
        const response = await fetch(
            `${API_BASE}/status`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            return;
        }

        const status =
            await response.json();

        const updatedAt =
            Number(status?.updatedAt);

        if (
            !Number.isFinite(
                updatedAt
            )
        ) {
            return;
        }

        if (
            lastWebhookTimestamp === null
        ) {
            lastWebhookTimestamp =
                updatedAt;

            return;
        }

        if (
            updatedAt >
            lastWebhookTimestamp
        ) {
            lastWebhookTimestamp =
                updatedAt;

            const currentTarget =
                window.currentTargetPlayer
                    ?.nickname ||
                DEFAULT_TARGET;

            console.log(
                "FACEIT: wykryto zakończenie meczu — odświeżam widget"
            );

            await loadPlayers(
                currentTarget
            );
        }

    } catch (error) {
        console.error(
            "Webhook watcher error:",
            error
        );
    } finally {
        webhookCheckRunning =
            false;
    }
}

setInterval(
    checkWebhookStatus,
    10 * 1000
);

setTimeout(
    checkWebhookStatus,
    2000
);
