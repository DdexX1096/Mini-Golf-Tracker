let appData = JSON.parse(localStorage.getItem("golfData")) || {
  players: [],
  games: [],
  currentGame: null,
  viewingGame: null // NEW
};

function save() {
  localStorage.setItem("golfData", JSON.stringify(appData));
}

/* ==========================
   PLAYERS
========================== */

function addPlayer() {
  const input = document.getElementById("playerName");
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  appData.players.push(name);
  input.value = "";

  save();
  renderPlayers();
  renderPlayerSelect();
}

function deletePlayer(index) {
  appData.players.splice(index, 1);
  save();
  renderPlayers();
  renderPlayerSelect();
}

function renderPlayers() {
  const list = document.getElementById("playerList");
  if (!list) return;

  list.innerHTML = "";

  appData.players.forEach((p, i) => {
    list.innerHTML += `
      <div class="player">
        ${p}
        <button onclick="deletePlayer(${i})">&times;</button>
      </div>
    `;
  });
}

function renderPlayerSelect() {
  const div = document.getElementById("playersSelect");
  if (!div) return;

  div.innerHTML = "";

  appData.players.forEach((p) => {
    div.innerHTML += `
      <label class="player select-player">
        <span>${p}</span>
        <input type="checkbox" value="${p}">
      </label>
    `;
  });
}

/* ==========================
   START GAME
========================== */

function startGame() {
  const selected = [...document.querySelectorAll("input[type=checkbox]:checked")]
    .map(x => x.value);

  if (selected.length < 2) {
    alert("Select at least 2 players");
    return;
  }

  appData.currentGame = {
    players: selected.map(name => ({
      name,
      scores: Array(18).fill(0)
    })),
    hole: 0
  };

  appData.viewingGame = null;

  save();
  window.location.href = "game.html";
}

/* ==========================
   VIEW GAME
========================== */

function viewGame(index) {
  appData.viewingGame = appData.games[index];
  save();
  window.location.href = "game.html";
}

/* ==========================
   GAME RENDER
========================== */

function renderGame() {
  const container = document.getElementById("playersGame");
  if (!container) return;

  const game = appData.viewingGame || appData.currentGame;

  if (!game) {
    window.location.href = "index.html";
    return;
  }

  const isViewing = !!appData.viewingGame;

  // UI toggle
  document.getElementById("viewModeLabel").style.display = isViewing ? "block" : "none";
  document.getElementById("navButtons").style.display = "flex";
  document.getElementById("endGameBtn").style.display = isViewing ? "none" : "block";

  container.innerHTML = "";

  game.players.forEach((p, i) => {
    const total = p.scores.reduce((a,b) => a+b, 0);

    container.innerHTML += `
      <div class="card">
        <h3>${p.name}</h3>
        <p>Total: ${total}</p>

        <div class="score-row">
          ${isViewing ? "" : `<button class="score-btn" onclick="changeScore(${i}, -1)">−</button>`}
          <div class="score-display">${p.scores[game.hole]}</div>
          ${isViewing ? "" : `<button class="score-btn" onclick="changeScore(${i}, 1)">+</button>`}
        </div>
      </div>
    `;
  });

  document.getElementById("holeTitle").innerText = `Hole ${game.hole + 1}`;
  document.getElementById("progressText").innerText = `${game.hole + 1} of 18`;

  document.getElementById("progressBar").style.width =
    ((game.hole + 1) / 18) * 100 + "%";
}

/* ==========================
   SCORE
========================== */

function changeScore(i, change) {
  let val = appData.currentGame.players[i].scores[appData.currentGame.hole];
  val = Math.max(0, val + change);
  appData.currentGame.players[i].scores[appData.currentGame.hole] = val;
  save();
  renderGame();
}

/* ==========================
   HOLES
========================== */

function nextHole() {
  let game = appData.viewingGame || appData.currentGame;
  if (game.hole < 17) {
    game.hole++;
    save();
    renderGame();
  }
}

function prevHole() {
  let game = appData.viewingGame || appData.currentGame;
  if (game.hole > 0) {
    game.hole--;
    save();
    renderGame();
  }
}

/* ==========================
   END GAME
========================== */

function endGame() {
  const game = appData.currentGame;

  const results = game.players.map(p => ({
    name: p.name,
    score: p.scores.reduce((a,b) => a+b, 0),
    scores: p.scores // SAVE PER HOLE
  }));

  results.sort((a,b) => a.score - b.score);

  appData.games.push({
    date: new Date().toLocaleDateString(),
    players: game.players // FULL DATA
  });

  appData.currentGame = null;

  save();
  window.location.href = "games.html";
}

/* ==========================
   GAMES LIST
========================== */

function renderGames() {
  const div = document.getElementById("gamesList");
  if (!div) return;

  div.innerHTML = "";

  appData.games.forEach((g, i) => {
    div.innerHTML += `
      <div class="card">
        <div style="display:flex;justify-content:space-between;">
          <h3>${g.date}</h3>
          <div>
            <button onclick="viewGame(${i})">View</button>
            <button class="secondary" onclick="deleteGame(${i})">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}

/* ==========================
   DELETE
========================== */

function deleteGame(i) {
  appData.games.splice(i, 1);
  save();
  renderGames();
}

/* ==========================
   EXPORT CSV
========================== */

function exportData() {
  let rows = [["Date","Player","Hole","Score"]];

  appData.games.forEach(game => {
    game.players.forEach(player => {
      player.scores.forEach((score, hole) => {
        rows.push([game.date, player.name, hole+1, score]);
      });
    });
  });

  let csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "golf_data.csv";
  a.click();

  URL.revokeObjectURL(url);
}

/* ==========================
   INIT
========================== */

renderPlayers();
renderPlayerSelect();
renderGames();
renderGame();
