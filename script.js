const data = {

    me: {

        nickname: "-krajewsky-",

        level: 10,

        elo: 2145,

        wins: "58%",

        matches: 342,

        kd: "1.18",

        form: "W W L W W"

    },


    target: {

        nickname: "-TOBOL-",

        level: 10,

        elo: 1925

    }

};


/* LEVEL */

document.getElementById("myLevel").textContent =
    data.me.level;

document.getElementById("targetLevel").textContent =
    data.target.level;


/* ELO */

document.getElementById("myElo").textContent =
    data.me.elo.toLocaleString("en-US");

document.getElementById("targetElo").textContent =
    data.target.elo.toLocaleString("en-US");


/* DIFFERENCE */

const difference =
    data.me.elo - data.target.elo;


document.getElementById("difference").textContent =

    (difference >= 0 ? "+" : "") +
    difference +
    " ELO";


/* STATS */

document.getElementById("wins").textContent =
    data.me.wins;

document.getElementById("matches").textContent =
    data.me.matches;

document.getElementById("kd").textContent =
    data.me.kd;

document.getElementById("form").textContent =
    data.me.form;


/* PROGRESS */

const highest =
    Math.max(
        data.me.elo,
        data.target.elo
    );


const lowest =
    Math.min(
        data.me.elo,
        data.target.elo
    );


let progress;


if (highest === lowest) {

    progress = 50;

} else {

    progress =
        (
            (data.me.elo - lowest) /
            (highest - lowest)
        ) * 100;

}


progress =
    Math.max(
        10,
        Math.min(
            90,
            progress
        )
    );


document.getElementById(
    "progressBar"
).style.width =
    progress + "%";
