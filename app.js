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

// THIS FUNCTION LOADS THE DATA INTO YOUR HTML
function render() {
  // 1. Update Player List (THIS SHOWS THE PLAYED COUNT)
  document.getElementById("playerList").innerHTML =
    players.map(p => `
      <div class="player">
        <span><strong>${p}</strong> <span class="play-count-tag">${playCounts[p] || 0} games</span></span>
        <button onclick="removePlayer('${p}')" style="background: #ff4b2b; color: white; padding: 4px 8px; font-size: 10px;">X</button>
      </div>
    `).join("");

  // 2. Update Leaderboard
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

// RANDOM SHUFFLE FUNCTION (Fixes the "not shuffling" issue)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getAvailablePool() {
  let unplayed = players.filter(p => !playedInCurrentCycle.includes(p));
  
  // Reset cycle if we don't have enough people for a full match
  if (unplayed.length < 4) {
    playedInCurrentCycle = [];
    unplayed = [...players];
  }
  
  return shuffle(unplayed); // Always shuffle the pool before picking
}

function pickTeam(pool) {
  let team = [];
  if (pool.length < 2) return pool;

  // Try to find a partner that hasn't played with the first person recently
  team.push(pool[0]);
  for (let i = 1; i < pool.length; i++) {
    if (!partnerHistory[team[0]].includes(pool[i])) {
      team.push(pool[i]);
      break;
    }
  }

  // Fallback if everyone has already played together
  if (team.length < 2) {
    team.push(pool[1]);
  }
  
  return team;
}

function startMatch() {
  if (players.length < 4) {
    alert("You need at least 4 players!");
    return;
  }

  let pool = getAvailablePool();
  
  // Pick Team A
  const teamA = pickTeam(pool);
  
  // Pick Team B from what is left
  let remainingPool = pool.filter(p => !teamA.includes(p));
  const teamB = pickTeam(remainingPool);

  // Mark as played so they don't repeat until the cycle resets
  playedInCurrentCycle.push(...teamA, ...teamB);

  document.getElementById("court").innerHTML = `
    <div class="match-display">
      <div class="team-container"><strong>Team A:</strong> ${teamA.join(" & ")}</div>
      <div class="vs">VS</div>
      <div class="team-container"><strong>Team B:</strong> ${teamB.join(" & ")}</div>
      <div style="margin-top: 15px;">
        <button onclick="recordResult(['${teamA[0]}','${teamA[1]}'], ['${teamB[0]}','${teamB[1]}'], 'A')">Team A Wins</button>
        <button onclick="recordResult(['${teamB[0]}','${teamB[1]}'], ['${teamA[0]}','${teamA[1]}'], 'B')">Team B Wins</button>
      </div>
    </div>
  `;
}

function recordResult(winners, losers, side) {
  // Update Wins
  winners.forEach(p => leaderboard[p]++);
  
  // Update Play Counts (IMPORTANT: This is what you wanted to see)
  [...winners, ...losers].forEach(p => {
    playCounts[p] = (playCounts[p] || 0) + 1;
  });

  // Track Partners to prevent repeating teams
  partnerHistory[winners[0]].push(winners[1]);
  partnerHistory[winners[1]].push(winners[0]);
  partnerHistory[losers[0]].push(losers[1]);
  partnerHistory[losers[1]].push(losers[0]);

  render();
  document.getElementById("court").innerHTML = `<button onclick="startMatch()" style="width: 100%;">Next Match</button>`;
}
