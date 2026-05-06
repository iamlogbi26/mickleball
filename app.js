let players = [];
let playedInCurrentCycle = []; // Tracks who has played in the current round
let leaderboard = {};
let playCounts = {}; // Track total games played per player
let lastTeammates = {}; // Prevent same teammates repeating immediately

function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  if (!name || players.includes(name)) return;

  players.push(name);
  leaderboard[name] = 0;
  playCounts[name] = 0;
  lastTeammates[name] = null;

  document.getElementById("playerName").value = "";
  render();
}

function render() {
  // Render Player List with Play Counts
  document.getElementById("playerList").innerHTML =
    players.map(p => `
      <div class="player">
        ${p} <small>(${playCounts[p]} games)</small>
        <button onclick="removePlayer('${p}')">X</button>
      </div>
    `).join("");

  // Render Leaderboard
  document.getElementById("leaderboard").innerHTML =
    Object.entries(leaderboard)
      .sort((a, b) => b[1] - a[1])
      .map(([p, w]) => `<div>${p} <span class="badge">${w} wins</span></div>`)
      .join("");
}

function removePlayer(name) {
  players = players.filter(p => p !== name);
  playedInCurrentCycle = playedInCurrentCycle.filter(p => p !== name);
  delete leaderboard[name];
  delete playCounts[name];
  delete lastTeammates[name];
  render();
}

function getAvailablePlayers() {
  // If everyone has played, reset the cycle
  if (playedInCurrentCycle.length >= players.length || (players.length - playedInCurrentCycle.length) < 4) {
    playedInCurrentCycle = [];
  }

  // Get players who haven't played this cycle
  let pool = players.filter(p => !playedInCurrentCycle.includes(p));
  
  // Shuffle pool to ensure random variety
  return pool.sort(() => Math.random() - 0.5);
}

function startMatch() {
  if (players.length < 4) {
    alert("Need at least 4 players!");
    return;
  }

  let pool = getAvailablePlayers();
  let match = [];

  // Logic to prevent same teammates
  for (let i = 0; i < pool.length; i++) {
    if (match.length === 4) break;
    let candidate = pool[i];
    
    // Simple check: if this is the 2nd or 4th person, check if they were 
    // teamed up with the previous person last time
    let partnerIdx = match.length === 1 ? 0 : (match.length === 3 ? 2 : -1);
    
    if (partnerIdx !== -1 && lastTeammates[match[partnerIdx]] === candidate) {
        continue; // Skip this person for this specific slot if possible
    }
    match.push(candidate);
  }

  // Fallback: If logic is too restrictive, just take the first 4
  if (match.length < 4) match = pool.slice(0, 4);

  // Mark as played in current cycle
  match.forEach(p => playedInCurrentCycle.push(p));

  document.getElementById("court").innerHTML = `
    <div class="match-box">
      <p><strong>Team A:</strong> ${match[0]} & ${match[1]}</p>
      <p><strong>Team B:</strong> ${match[2]} & ${match[3]}</p>
      <button onclick="recordResult(['${match[0]}','${match[1]}'], ['${match[2]}','${match[3]}'], 'A')">Team A Wins</button>
      <button onclick="recordResult(['${match[0]}','${match[1]}'], ['${match[2]}','${match[3]}'], 'B')">Team B Wins</button>
    </div>
  `;
}

function recordResult(teamA, teamB, winnerSide) {
  const winners = winnerSide === 'A' ? teamA : teamB;
  const losers = winnerSide === 'A' ? teamB : teamA;

  // Update Wins
  winners.forEach(p => leaderboard[p]++);
  
  // Update Play Counts
  [...teamA, ...teamB].forEach(p => playCounts[p]++);

  // Record Teammates to prevent immediate repeats
  lastTeammates[teamA[0]] = teamA[1];
  lastTeammates[teamA[1]] = teamA[0];
  lastTeammates[teamB[0]] = teamB[1];
  lastTeammates[teamB[1]] = teamB[0];

  render();
  
  // "Winners/Losers rotation" logic: 
  // In a social rotation, we usually trigger the next match immediately
  startMatch();
}
