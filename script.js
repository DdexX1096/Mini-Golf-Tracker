let appData = JSON.parse(localStorage.getItem("golfData")) || {
  players: [],
  games: [],
  currentGame: null
};

function save() {
  localStorage.setItem("golfData", JSON.stringify(appData));
}

/* ==========================
   PLAYERS
========================== */

function addPlayer() {
  const input = document.getElementById("playerName");
  const name = input.value.trim();

  if (!name) return;

  appData.players.push(name);
  input.value = "";

  save();
  renderPlayers();
  renderPlayerSelect();
}

function deletePlayer(i) {
  appData.players.splice(i, 1);
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
        <button onclick="deletePlayer(${i})">x</button>
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
      <label class="player">
        <input type="checkbox" value="${p}">
        ${p}
      </label>
    `;
  });
}

/* ==========================
   GAME START
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

  save();
  window.location.href = "game.html";
}

/* ==========================
   GAME PLAY
========================== */

function renderGame() {
  const game = appData.currentGame;
  if (!game) return;

  const container = document.getElementById("playersGame");
  if (!container) return;

  container.innerHTML = "";

  game.players.forEach((p, i) => {
    const total = p.scores.reduce((a,b) => a+b, 0);

    container.innerHTML += `
      <div class="card">
        <h3>${p.name}</h3>
        <p>Total: ${total}</p>

        <div class="score-row">
          <button class="score-btn" onclick="changeScore(${i}, -1)">−</button>

          <div class="score-display">
            ${p.scores[game.hole]}
          </div>

          <button class="score-btn" onclick="changeScore(${i}, 1)">+</button>
        </div>
      </div>
    `;
  });

  document.getElementById("holeTitle").innerText = `Hole ${game.hole + 1}`;
  document.getElementById("progressText").innerText = `${game.hole + 1} of 18`;

  document.getElementById("progressBar").style.width =
    ((game.hole + 1) / 18) * 100 + "%";
}

function changeScore(playerIndex, change) {
  const game = appData.currentGame;
  let val = game.players[playerIndex].scores[game.hole];

  val += change;
  if (val < 0) val = 0;

  game.players[playerIndex].scores[game.hole] = val;

  save();
  renderGame();
}

function nextHole() {
  const game = appData.currentGame;

  if (game.hole < 17) {
    game.hole++;
    save();
    renderGame();
  } else {
    endGame();
  }
}

/* ==========================
   END GAME
========================== */

function endGame() {
  const game = appData.currentGame;

  const results = game.players.map(p => ({
    name: p.name,
    score: p.scores.reduce((a,b) => a+b, 0)
  }));

  results.sort((a,b) => a.score - b.score);

  appData.games.push({
    date: new Date().toLocaleDateString(),
    results
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

  appData.games.forEach(g => {
    let html = `<div class="card"><h3>${g.date}</h3>`;

    g.results.forEach((r, i) => {
      html += `<p>${i+1}. ${r.name} - ${r.score}</p>`;
    });

    html += `</div>`;
    div.innerHTML += html;
  });
}

/* ==========================
   INIT
========================== */

renderPlayers();
renderPlayerSelect();
renderGames();
renderGame();