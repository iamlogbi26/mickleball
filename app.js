let players = [];
let playedInCurrentCycle = []; 
let lastWinners = [];
let lastLosers = [];
let leaderboard = {};
let playCounts = {}; 
let partnerHistory = {}; 

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
  // Update Player List with Play Counts
  document.getElementById("playerList").innerHTML =
    players.map(p => `
      <div class="player">
        <span>${p} <span class="play-count-tag">${playCounts[p] || 0} games played</span></span>
        <button onclick="removePlayer('${p}')" style="background: #ff4b2b; color: white; padding: 4px 8px; font-size: 10px;">X</button>
      </div>
    `).join("");

  // Update Leaderboard
  document.getElementById("leaderboard").innerHTML =
    Object.entries(leaderboard)
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
  playedInCurrentCycle = playedInCurrentCycle.filter(p => p !== name);
  delete leaderboard[name];
  delete playCounts[name];
  delete partnerHistory[name];
  render();
}

function getAvailablePool() {
  // If fewer than 4 players are left unplayed, reset the cycle
  if ((players.length - playedInCurrentCycle.length) < 4) {
    playedInCurrentCycle = [];
  }
  return players.filter(p => !playedInCurrentCycle.includes(p));
}

function pickTeam(pool, preferredPlayers) {
  let team = [];
  // Sort: prioritize players who were in the "preferred" list (winners or losers)
  let candidates = [...pool].sort((a, b) => {
    const aPref = preferredPlayers.includes(a) ? -1 : 1;
    const bPref = preferredPlayers.includes(b) ? -1 : 1;
    return aPref - bPref;
  });

  for (let p of candidates) {
    if (team.length === 0) {
      team.push(p);
    } else if (team.length === 1) {
      // Check if they have teamed up before
      if (!partnerHistory[team[0]].includes(p)) {
        team.push(p);
        break;
      }
    }
  }

  // Fallback: If no new partner found, just take the next available person
  if (team.length < 2) team = candidates.slice(0, 2);
  
  return team;
}

function startMatch() {
  if (players.length < 4) {
    alert("You need at least 4 players to start!");
    return;
  }

  let pool = getAvailablePool();
  
  // Pick Team A (Tries to pick from last winners)
  const teamA = pickTeam(pool, lastWinners);
  
  // Filter out Team A to pick Team B
  let remainingPool = pool.filter(p => !teamA.includes(p));
  
  // Pick Team B (Tries to pick from last losers)
  const teamB = pickTeam(remainingPool, lastLosers);

  // Mark these 4 as "played" for this cycle
  playedInCurrentCycle.push(...teamA, ...teamB);

  document.getElementById("court").innerHTML = `
    <div class="match-display">
      <div class="team-container">
        <strong>Team A:</strong> ${teamA[0]} & ${teamA[1]}
      </div>
      <div class="vs">VS</div>
      <div class="team-container">
        <strong>Team B:</strong> ${teamB[0]} & ${teamB[1]}
      </div>
      <div style="margin-top: 15px;">
        <button onclick="recordResult(['${teamA[0]}','${teamA[1]}'], ['${teamB[0]}','${teamB[1]}'], 'A')">Team A Wins</button>
        <button onclick="recordResult(['${teamA[0]}','${teamA[1]}'], ['${teamB[0]}','${teamB[1]}'], 'B')">Team B Wins</button>
      </div>
    </div>
  `;
}

function recordResult(teamA, teamB, winnerSide) {
  const winners = winnerSide === 'A' ? teamA : teamB;
  const losers = winnerSide === 'A' ? teamB : teamA;

  // Update Stats
  winners.forEach(p => leaderboard[p]++);
  [...teamA, ...teamB].forEach(p => playCounts[p]++);

  // Store for next match priority
  lastWinners = [...winners];
  lastLosers = [...losers];

  // Record partnership to avoid immediate repeats
  partnerHistory[teamA[0]].push(teamA[1]);
  partnerHistory[teamA[1]].push(teamA[0]);
  partnerHistory[teamB[0]].push(teamB[1]);
  partnerHistory[teamB[1]].push(teamB[0]);

  render();
  
  // Clear court display until next "Start Match" click or auto-start
  document.getElementById("court").innerHTML = `<p style="color: #00c6ff;">Result recorded! Click Start Match for next game.</p>`;
}
