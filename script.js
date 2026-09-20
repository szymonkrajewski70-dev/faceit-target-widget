const API_BASE =
  "https://faceit-target-api.szymonkrajewski70.workers.dev";

const ME = "-krajewsky-";
const TARGET = "-TOBOL-";

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

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function updateProgress(myElo, targetElo) {
  const highest = Math.max(myElo, targetElo);
  const lowest = Math.min(myElo, targetElo);

  let progress;

  if (highest === lowest) {
    progress = 50;
  } else {
    progress =
      ((myElo - lowest) / (highest - lowest)) * 100;
  }

  progress = Math.max(
    10,
    Math.min(90, progress)
  );

  const progressBar =
    document.getElementById("progressBar");

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

function formatRecentForm(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return "-";
  }

  return results
    .slice(0, 5)
    .map(result => {
      if (result === 1 || result === "1") {
        return "W";
      }

      if (result === 0 || result === "0") {
        return "L";
      }

      if (result === -1 || result === "-1") {
        return "L";
      }

      return "?";
    })
    .join(" ");
}

async function loadPlayers() {
  try {
    const [me, target] = await Promise.all([
      getPlayer(ME),
      getPlayer(TARGET)
    ]);

    console.log("FACEIT - me:", me);
    console.log("FACEIT - target:", target);

    /*
     * LEVEL
     */
    setText("myLevel", me.level ?? "-");
    setText("targetLevel", target.level ?? "-");

    /*
     * ELO
     */
    const myElo = Number(me.elo) || 0;
    const targetElo = Number(target.elo) || 0;

    setText(
      "myElo",
      myElo.toLocaleString("en-US")
    );

    setText(
      "targetElo",
      targetElo.toLocaleString("en-US")
    );

    /*
     * ELO DIFFERENCE
     */
    const difference = myElo - targetElo;

    setText(
      "difference",
      `${difference >= 0 ? "+" : ""}${difference} ELO`
    );

    /*
     * LIVE STATISTICS
     */
    if (me.stats) {
      setText(
        "wins",
        me.stats.wins != null
          ? `${me.stats.wins}%`
          : "-"
      );

      setText(
        "matches",
        me.stats.matches != null
          ? me.stats.matches
          : "-"
      );

      setText(
        "kd",
        me.stats.kd != null
          ? Number(me.stats.kd).toFixed(2)
          : "-"
      );

      setText(
        "form",
        formatRecentForm(
          me.stats.recentResults
        )
      );
    }

    /*
     * PROGRESS BAR
     */
    updateProgress(myElo, targetElo);

  } catch (error) {
    console.error(
      "FACEIT Widget Error:",
      error
    );

    setText("myLevel", "ERR");
    setText("targetLevel", "ERR");
    setText("myElo", "ERR");
    setText("targetElo", "ERR");

    setText("wins", "ERR");
    setText("matches", "ERR");
    setText("kd", "ERR");
    setText("form", "ERR");
    setText("difference", "API ERROR");

    const progressBar =
      document.getElementById("progressBar");

    if (progressBar) {
      progressBar.style.width = "50%";
    }
  }
}

loadPlayers();
