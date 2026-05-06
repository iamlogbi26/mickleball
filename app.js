let players = [];
let queue = [];
let history = {};
let leaderboard = {};

function addPlayer() {
  const name = document.getElementById("playerName").value;
  if (!name) return;

  players.push(name);
  queue.push(name);
  leaderboard[name] = 0;
  history[name] = [];

  document.getElementById("playerName").value = "";
  render();
}

function render() {
  document.getElementById("playerList").innerHTML =
    players.map(p => `
      <div class="player">
        ${p}
        <button onclick="removePlayer('${p}')">X</button>
      </div>
    `).join("");

  document.getElementById("leaderboard").innerHTML =
    Object.entries(leaderboard)
      .sort((a,b)=>b[1]-a[1])
      .map(([p,w])=> `<div>${p} <span class="badge">${w} wins</span></div>`)
      .join("");
}

function removePlayer(name) {
  players = players.filter(p => p !== name);
  queue = queue.filter(p => p !== name);
  delete leaderboard[name];
  delete history[name];
  render();
}

function pickPlayers() {
  queue.sort((a,b)=> (history[a].length - history[b].length));

  let team = [];
  while (team.length < 4 && queue.length > 0) {
    team.push(queue.shift());
  }
  return team;
}

function startMatch() {
  if (queue.length < 4) {
    queue = [...players];
  }

  const match = pickPlayers();

  document.getElementById("court").innerHTML = `
    <p>Team A: ${match[0]} & ${match[1]}</p>
    <p>Team B: ${match[2]} & ${match[3]}</p>

    <button onclick="winner('${match[0]}','${match[1]}')">Team A Wins</button>
    <button onclick="winner('${match[2]}','${match[3]}')">Team B Wins</button>
  `;
}

function winner(p1,p2){
  leaderboard[p1] = (leaderboard[p1]||0)+1;
  leaderboard[p2] = (leaderboard[p2]||0)+1;

  queue.push(p1,p2);

  render();
  startMatch();
}