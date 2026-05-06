let players = [];
let leaderboard = {};
let playCounts = {}; 
let partnerHistory = {}; 
let lastMatchPlayers = []; 
let activeMatches = {}; // Tracks which players are currently on which court

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

// NEW: Function to create a new court container
let courtCount = 0;
function addCourt() {
  courtCount++;
  const courtId = `court-${courtCount}`;
  const courtContainer = document.getElementById("courtsWrapper");
  
  const courtDiv = document.createElement("div");
  courtDiv.className = "panel glass court-card";
  courtDiv.id = courtId;
  courtDiv.innerHTML = `
    <h3>Court ${courtCount}</h3>
    <div id="${courtId}-display">
      <button onclick="assignMatch('${courtId}')" class="setup-btn">Setup Match</button>
    </div>
    <button onclick="removeCourt('${courtId}')" class="delete-btn">Close Court</button>
  `;
  courtContainer.appendChild(courtDiv);
}

function removeCourt(courtId) {
  const court = document.getElementById(courtId);
  if (court) court.remove();
  delete activeMatches[courtId];
}

function render() {
  // Update Player List
  document.getElementById("playerList").innerHTML = players.map(p => `
    <div class="player">
      <span><strong>${p}</strong> <span class="play-count-tag">${playCounts[p] || 0} games</span></span>
      <button onclick="removePlayer('${p}')" style="background: #ff4b2b; color: white; padding: 4px 8px; font-size: 10px;">X</button>
    </div>
  `).join("");

  // Update Leaderboard
  document.getElementById("leaderboard").innerHTML = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .map(([p, w]) => `
      <div class="player">
        <span>${p}</span>
        <span class="badge">${w} wins</span>
      </div>
    `).join("");
}

function assignMatch(courtId) {
  // Filter out players currently playing on other courts
  const currentlyPlaying = Object.values(activeMatches).flat();
  const availablePlayers = players.filter(p => !currentlyPlaying.includes(p));

  if (availablePlayers.length < 4) {
    alert("Not enough available players! Others are currently in matches.");
    return;
  }

  // Same fair rotation logic
  let sortedPool = [...availablePlayers].sort((a, b) => {
    const aJustPlayed = lastMatchPlayers.includes(a) ? 1 : 0;
    const bJustPlayed = lastMatchPlayers.includes(b) ? 1 : 0;
    if (playCounts[a] !== playCounts[b]) return playCounts[a] - playCounts[b];
    if (aJustPlayed !== bJustPlayed) return aJustPlayed - bJustPlayed;
    return Math.random() - 0.5;
  });

  const teamA = [sortedPool[0], sortedPool[1]];
  const teamB = [sortedPool[2], sortedPool[3]];
  
  activeMatches[courtId] = [...teamA, ...teamB];

  document.getElementById(`${courtId}-display`).innerHTML = `
    <div class="match-display">
      <div class="team-container"><strong>A:</strong> ${teamA.join(" & ")}</div>
      <div class="vs">VS</div>
      <div class="team-container"><strong>B:</strong> ${teamB.join(" & ")}</div>
      <button onclick="recordResult('${courtId}', ['${teamA[0]}','${teamA[1]}'], ['${teamB[0]}','${teamB[1]}'], 'A')">A Wins</button>
      <button onclick="recordResult('${courtId}', ['${teamB[0]}','${teamB[1]}'], ['${teamA[0]}','${teamA[1]}'], 'B')">B Wins</button>
    </div>
  `;
}

function recordResult(courtId, winners, losers) {
  winners.forEach(p => leaderboard[p]++);
  [...winners, ...losers].forEach(p => playCounts[p]++);
  lastMatchPlayers = [...winners, ...losers];
  
  // Clear this court from active tracking
  delete activeMatches[courtId];

  render();
  document.getElementById(`${courtId}-display`).innerHTML = `
    <button onclick="assignMatch('${courtId}')" class="setup-btn">Next Match</button>
  `;
}

function removePlayer(name) {
  players = players.filter(p => p !== name);
  delete leaderboard[name];
  delete playCounts[name];
  render();
}
