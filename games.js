// Oyun kodları bu dosyada bulunur.
function renderMemory(area) {
  const symbols = ["🍀","🚀","🎮","⭐","🍉","🐱","⚽","🎧"];
  let deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
  let opened = [], matched = [], moves = 0, locked = false;
  area.innerHTML = `<p class="game-status" id="memoryStatus">Hamle: 0 · Eşleşme: 0/8</p><div class="memory-board" id="memoryBoard"></div><div class="game-actions"><button class="secondary-button" id="memoryRestart">Yeniden başlat</button></div>`;
  const board = area.querySelector("#memoryBoard"), status = area.querySelector("#memoryStatus");
  function draw() {
    board.innerHTML = "";
    deck.forEach((symbol, index) => {
      const button = document.createElement("button");
      button.className = "memory-card" + (opened.includes(index) ? " flipped" : "") + (matched.includes(index) ? " matched" : "");
      button.textContent = opened.includes(index) || matched.includes(index) ? symbol : "?";
      button.disabled = matched.includes(index) || opened.includes(index) || locked;
      button.addEventListener("click", () => flip(index)); board.appendChild(button);
    });
    status.textContent = matched.length === 16 ? `Tebrikler! ${moves} hamlede tamamladın.` : `Hamle: ${moves} · Eşleşme: ${matched.length/2}/8`;
  }
  function flip(index) {
    if (locked || opened.length === 2 || matched.includes(index)) return;
    opened.push(index); draw();
    if (opened.length === 2) {
      moves++; locked = true; const [a,b] = opened;
      if (deck[a] === deck[b]) { matched.push(a,b); opened = []; locked = false; draw(); }
      else setTimeout(() => { opened = []; locked = false; draw(); }, 750);
    }
  }
  area.querySelector("#memoryRestart").addEventListener("click", () => renderMemory(area)); draw();
}

function renderTicTacToe(area) {
  let cells = Array(9).fill(""), turn = "X", finished = false;
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  area.innerHTML = `<p class="game-status" id="xoxStatus">Sıra: X</p><div class="xox-board" id="xoxBoard"></div><div class="game-actions"><button class="secondary-button" id="xoxRestart">Yeniden başlat</button></div>`;
  const board = area.querySelector("#xoxBoard"), status = area.querySelector("#xoxStatus");
  function draw() {
    board.innerHTML = "";
    cells.forEach((value, i) => { const button = document.createElement("button"); button.className = "xox-cell" + (value === "O" ? " o" : ""); button.textContent = value; button.disabled = !!value || finished; button.addEventListener("click", () => play(i)); board.appendChild(button); });
  }
  function play(i) {
    if (finished || cells[i]) return; cells[i] = turn;
    const winner = wins.find(line => line.every(index => cells[index] === turn));
    if (winner) { finished = true; status.textContent = `${turn} kazandı!`; }
    else if (cells.every(Boolean)) { finished = true; status.textContent = "Berabere!"; }
    else { turn = turn === "X" ? "O" : "X"; status.textContent = `Sıra: ${turn}`; } draw();
  }
  area.querySelector("#xoxRestart").addEventListener("click", () => renderTicTacToe(area)); draw();
}

function renderRace(area) {
  area.innerHTML = `
    <div class="race-wrap">
      <div class="race-hud"><span id="raceScore">Puan: 0</span><span id="raceBest">Rekor: ${Number(localStorage.getItem("dreamRaceBest")||0)}</span></div>
      <canvas class="race-canvas" id="raceCanvas" width="420" height="620" aria-label="Araba yarışı oyun alanı"></canvas>
      <p class="race-help">Bilgisayarda ← → veya A / D tuşlarını kullan. Telefonda aşağıdaki okları basılı tut.</p>
      <div class="race-controls"><button id="raceLeft" aria-label="Sola git">←</button><button id="raceRight" aria-label="Sağa git">→</button></div>
      <button class="secondary-button race-start" id="raceRestart">Yeniden başlat</button>
    </div>`;
  const canvas = area.querySelector("#raceCanvas"), ctx = canvas.getContext("2d");
  const scoreEl = area.querySelector("#raceScore"), bestEl = area.querySelector("#raceBest");
  const W = canvas.width, H = canvas.height, road = {left:65,right:355};
  let player, traffic, score, speed, frame, running, gameOver, keys, raf;
  const lanes = [115, 210, 305];
  function reset() {
    if (raf) cancelAnimationFrame(raf);
    player = {x:210,y:505,w:42,h:76}; traffic=[]; score=0; speed=4; frame=0; running=true; gameOver=false; keys={left:false,right:false}; draw(); loop();
  }
  function roundedRect(x,y,w,h,r,color) {
    ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill();
  }
  function car(x,y,color,playerCar=false) {
    roundedRect(x-21,y-38,42,76,10,color);
    roundedRect(x-14,y-23,28,22,5,playerCar?"#bde8ff":"#dce8f2");
    roundedRect(x-14,y+12,28,15,4,playerCar?"#24354a":"#26313b");
    ctx.fillStyle="#fff3b0"; ctx.fillRect(x-17,y-34,8,5); ctx.fillRect(x+9,y-34,8,5);
    ctx.fillStyle="#ef7373"; ctx.fillRect(x-17,y+29,8,5); ctx.fillRect(x+9,y+29,8,5);
  }
  function draw() {
    ctx.fillStyle="#27784f"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#343a43"; ctx.fillRect(road.left,0,road.right-road.left,H);
    ctx.fillStyle="#f4f4f4"; ctx.fillRect(road.left-5,0,5,H); ctx.fillRect(road.right,0,5,H);
    ctx.strokeStyle="#e8e8e8"; ctx.lineWidth=5; ctx.setLineDash([30,28]);
    const offset=(frame*speed*1.5)%58;
    [162,258].forEach(x=>{ctx.beginPath();ctx.moveTo(x,-58+offset);ctx.lineTo(x,H);ctx.stroke();}); ctx.setLineDash([]);
    // Yol kenarı işaretleri
    for(let y=-30+(frame*speed*1.7)%60;y<H;y+=60){ctx.fillStyle="#fff";ctx.fillRect(road.left-13,y,5,28);ctx.fillRect(road.right+8,y,5,28);}
    traffic.forEach(t=>car(t.x,t.y,t.color,false)); car(player.x,player.y,"#5869ed",true);
    if(gameOver){
      ctx.fillStyle="#111923cc";ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="bold 36px Arial";ctx.fillText("KAZA YAPTIN!",W/2,H/2-18);
      ctx.font="bold 20px Arial";ctx.fillText(`Puan: ${Math.floor(score)}`,W/2,H/2+20);
      ctx.font="16px Arial";ctx.fillText("Yeniden başlat'a bas",W/2,H/2+54);
    }
  }
  function spawn() {
    const lane=lanes[Math.floor(Math.random()*lanes.length)];
    traffic.push({x:lane,y:-60,w:42,h:76,color:["#e58b48","#db5965","#e5c64b","#55a6a0"][Math.floor(Math.random()*4)]});
  }
  function collide(a,b){return Math.abs(a.x-b.x)<34 && Math.abs(a.y-b.y)<61;}
  function loop() {
    if(!running)return;
    frame++; score += .12; speed = Math.min(8.5,4+score/180);
    if(keys.left)player.x-=5.2;if(keys.right)player.x+=5.2;
    player.x=Math.max(91,Math.min(329,player.x));
    if(frame%Math.max(34,75-Math.floor(speed*4))===0)spawn();
    traffic.forEach(t=>t.y+=speed);
    traffic=traffic.filter(t=>t.y<H+80);
    if(traffic.some(t=>collide(player,t))){gameOver=true;running=false;const best=Math.max(Math.floor(score),Number(localStorage.getItem("dreamRaceBest")||0));localStorage.setItem("dreamRaceBest",best);bestEl.textContent=`Rekor: ${best}`;}
    scoreEl.textContent=`Puan: ${Math.floor(score)}`;
    draw();
    if(running)raf=requestAnimationFrame(loop);
  }
  function keyDown(e){if(["ArrowLeft","ArrowRight","a","d","A","D"].includes(e.key)){e.preventDefault();if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=true;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=true;}}
  function keyUp(e){if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")keys.left=false;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")keys.right=false;}
  function holdButton(id,dir){const b=area.querySelector(id);const on=e=>{e.preventDefault();keys[dir]=true;};const off=e=>{e.preventDefault();keys[dir]=false;};b.addEventListener("pointerdown",on);["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,off));}
  document.addEventListener("keydown",keyDown);document.addEventListener("keyup",keyUp);
  holdButton("#raceLeft","left");holdButton("#raceRight","right");
  area.querySelector("#raceRestart").addEventListener("click",reset);
  // Oyun penceresi kapatılırken klavye dinleyicilerini temizle.
  const observer=new MutationObserver(()=>{if(!area.isConnected||!area.querySelector("#raceCanvas")){document.removeEventListener("keydown",keyDown);document.removeEventListener("keyup",keyUp);observer.disconnect();if(raf)cancelAnimationFrame(raf);}});
  observer.observe(area,{childList:true,subtree:true});
  reset();
}
