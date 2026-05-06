let players = [];
let leaderboard = {};
let playCounts = {}; 
let partnerHistory = {}; 
let lastMatchPlayers = []; // Specifically used to prevent immediate back-to-back play

function addPlayer() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim();
  
  if (!name || players.includes(name)) return;

  players.push(name);
  leaderboard[name] = 0;
  playCounts[name] = 0;
  partnerHistory[name] = [];

  nameInput.value = "";
  render();
}

function render() {
  // 1. Update Player List (SHOWING PLAY COUNT)
  const listEl = document.getElementById("playerList");
  listEl.innerHTML = players.map(p => `
    <div class="player">
      <span><strong>${p}</strong> <span class="play-count-tag">${playCounts[p] || 0} games</span></span>
      <button onclick="removePlayer('${p}')" style="background: #ff4b2b; color: white; padding: 4px 8px; font-size: 10px;">X</button>
    </div>
  `).join("");

  // 2. Update Leaderboard
  const leaderEl = document.getElementById("leaderboard");
  leaderEl.innerHTML = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .map(([p, w]) => `
      <div class="player">
        <span>${p}</span>
        <span class="badge">${w} wins</span>
      </div>
    `).join("");
}

function removePlayer(name) {
  players = players.filter(p => p !== name);
  delete leaderboard[name];
  delete playCounts[name];
  delete partnerHistory[name];
  render();
}

function startMatch() {
  if (players.length < 4) {
    alert("Need at least 4 players!");
    return;
  }

  // SORTING LOGIC: 
  // 1. Prioritize people with the lowest "Play Count"
  // 2. Then randomize among those with equal counts
  // 3. Move people who JUST played to the very end of the list
  let sortedPool = [...players].sort((a, b) => {
    // If one person just played and the other didn't, the one who didn't goes first
    const aJustPlayed = lastMatchPlayers.includes(a) ? 1 : 0;
    const bJustPlayed = lastMatchPlayers.includes(b) ? 1 : 0;
    
    if (playCounts[a] !== playCounts[b]) {
      return playCounts[a] - playCounts[b]; // Fewer games played comes first
    }
    if (aJustPlayed !== bJustPlayed) {
      return aJustPlayed - bJustPlayed; // People who didn't just play come first
    }
    return Math.random() - 0.5; // Randomize the rest
  });

  const teamA = [sortedPool[0], sortedPool[1]];
  const teamB = [sortedPool[2], sortedPool[3]];

  // If Team A already played together, swap one player from Team B
  if (partnerHistory[teamA[0]].includes(teamA[1]) && sortedPool.length > 3) {
      const temp = teamA[1];
      teamA[1] = teamB[0];
      teamB[0] = temp;
  }

  document.getElementById("court").innerHTML = `
    <div class="match-display">
      <div class="team-container"><strong>Team A:</strong> ${teamA[0]} & ${teamA[1]}</div>
      <div class="vs">VS</div>
      <div class="team-container"><strong>Team B:</strong> ${teamB[0]} & ${teamB[1]}</div>
      <div style="margin-top: 15px;">
        <button onclick="recordResult(['${teamA[0]}','${teamA[1]}'], ['${teamB[0]}','${teamB[1]}'], 'A')">Team A Wins</button>
        <button onclick="recordResult(['${teamB[0]}','${teamB[1]}'], ['${teamA[0]}','${teamA[1]}'], 'B')">Team B Wins</button>
      </div>
    </div>
  `;
}

function recordResult(winners, losers) {
  winners.forEach(p => leaderboard[p]++);
  [...winners, ...losers].forEach(p => {
    playCounts[p]++;
  });

  // Track who just played to prevent them from repeating immediately
  lastMatchPlayers = [...winners, ...losers];

  // Track partners
  partnerHistory[winners[0]].push(winners[1]);
  partnerHistory[winners[1]].push(winners[0]);
  partnerHistory[losers[0]].push(losers[1]);
  partnerHistory[losers[1]].push(losers[0]);

  render();
  document.getElementById("court").innerHTML = `<button onclick="startMatch()" style="width: 100%;">Next Match</button>`;
}
