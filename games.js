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


// Yılan Oyunu
function renderSnake(area) {
  area.innerHTML = `
    <div class="snake-wrap">
      <div class="snake-hud"><span id="snakeScore">Puan: 0</span><span id="snakeBest">Rekor: 0</span><span id="snakeStatus">Başlamaya hazır</span></div>
      <canvas id="snakeCanvas" class="snake-board" width="400" height="400" aria-label="Yılan oyunu alanı"></canvas>
      <div class="snake-actions"><button class="primary" id="snakeStart">Başlat / Yeniden başlat</button><button id="snakePause">Duraklat</button></div>
      <div class="snake-pad" aria-label="Dokunmatik yön tuşları"><button data-dir="up" aria-label="Yukarı">↑</button><button data-dir="left" aria-label="Sola">←</button><button data-dir="down" aria-label="Aşağı">↓</button><button data-dir="right" aria-label="Sağa">→</button></div>
      <p class="snake-help">Bilgisayarda yön tuşları veya WASD, telefonda ok tuşlarıyla oyna.</p>
    </div>`;
  const canvas=area.querySelector('#snakeCanvas'), ctx=canvas.getContext('2d');
  const scoreEl=area.querySelector('#snakeScore'), bestEl=area.querySelector('#snakeBest'), statusEl=area.querySelector('#snakeStatus');
  const size=20, cells=20; let snake, direction, nextDirection, food, score, running=false, paused=false, timer=null;
  let best=Number(localStorage.getItem('dreamSnakeBest')||0); bestEl.textContent=`Rekor: ${best}`;
  function randomFood(){let f; do{f={x:Math.floor(Math.random()*cells),y:Math.floor(Math.random()*cells)}}while(snake.some(s=>s.x===f.x&&s.y===f.y));return f;}
  function draw(){
    ctx.fillStyle='#071b25';ctx.fillRect(0,0,400,400);
    ctx.strokeStyle='rgba(125,210,190,.08)';ctx.lineWidth=1;
    for(let i=0;i<=cells;i++){ctx.beginPath();ctx.moveTo(i*size,0);ctx.lineTo(i*size,400);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*size);ctx.lineTo(400,i*size);ctx.stroke();}
    ctx.fillStyle='#ffca65';ctx.beginPath();ctx.arc(food.x*size+10,food.y*size+10,7,0,Math.PI*2);ctx.fill();
    snake.forEach((part,i)=>{ctx.fillStyle=i===0?'#69f0b5':'#28bd8b';ctx.beginPath();ctx.roundRect(part.x*size+2,part.y*size+2,size-4,size-4,6);ctx.fill();});
    if(!running){ctx.fillStyle='rgba(3,12,20,.62)';ctx.fillRect(0,0,400,400);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 22px sans-serif';ctx.fillText(score>0?'Oyun bitti!':'YILAN OYUNU',200,185);ctx.font='14px sans-serif';ctx.fillText(score>0?'Tekrar başlat ve rekorunu geliştir':'Başlat düğmesine bas',200,215);}
    if(paused&&running){ctx.fillStyle='rgba(3,12,20,.55)';ctx.fillRect(0,0,400,400);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 24px sans-serif';ctx.fillText('DURAKLATILDI',200,205);}
  }
  function stop(){running=false;paused=false;if(timer)clearInterval(timer);timer=null;}
  function finish(){stop();statusEl.textContent='Oyun bitti';if(score>best){best=score;localStorage.setItem('dreamSnakeBest',best);}bestEl.textContent=`Rekor: ${best}`;draw();}
  function step(){if(!running||paused)return;direction=nextDirection;const head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};
    const eating=head.x===food.x&&head.y===food.y;const body=eating?snake:snake.slice(0,-1);
    if(head.x<0||head.x>=cells||head.y<0||head.y>=cells||body.some(p=>p.x===head.x&&p.y===head.y)){finish();return;}
    snake.unshift(head);if(eating){score+=10;scoreEl.textContent=`Puan: ${score}`;food=randomFood();}else snake.pop();draw();
  }
  function start(){stop();snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];direction={x:1,y:0};nextDirection={x:1,y:0};score=0;scoreEl.textContent='Puan: 0';food=randomFood();running=true;statusEl.textContent='Oynuyorsun';draw();timer=setInterval(step,125);}
  function turn(dir){const map={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};const d=map[dir];if(!d||d.x===-direction.x&&d.y===-direction.y)return;nextDirection=d;if(!running)start();}
  function onKey(e){const keys={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};const dir=keys[e.key];if(dir){e.preventDefault();turn(dir);}else if(e.key===' '&&running){e.preventDefault();togglePause();}}
  function togglePause(){if(!running)return;paused=!paused;statusEl.textContent=paused?'Duraklatıldı':'Oynuyorsun';area.querySelector('#snakePause').textContent=paused?'Devam et':'Duraklat';draw();}
  document.addEventListener('keydown',onKey);
  area.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>turn(b.dataset.dir)));
  area.querySelector('#snakeStart').addEventListener('click',start);
  area.querySelector('#snakePause').addEventListener('click',togglePause);
  const observer=new MutationObserver(()=>{if(!area.isConnected||!area.querySelector('#snakeCanvas')){stop();document.removeEventListener('keydown',onKey);observer.disconnect();}});
  observer.observe(area,{childList:true,subtree:true});
  snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];direction={x:1,y:0};nextDirection={x:1,y:0};food={x:14,y:10};score=0;draw();
}


function renderFlappy(area) {
  area.innerHTML = `
    <div class="flappy-wrap">
      <div class="snake-hud"><span id="flappyScore">Puan: 0</span><span id="flappyBest">Rekor: ${Number(localStorage.getItem("dreamFlappyBest") || 0)}</span></div>
      <canvas id="flappyCanvas" class="flappy-canvas" width="420" height="560" aria-label="Uçan Kuş oyun alanı"></canvas>
      <p class="game-status" id="flappyStatus">Başlamak ve kanat çırpmak için dokun veya Boşluk tuşuna bas.</p>
      <div class="game-actions"><button class="secondary-button" id="flappyRestart">Yeniden başlat</button></div>
    </div>`;
  const canvas=area.querySelector("#flappyCanvas"), ctx=canvas.getContext("2d");
  const scoreEl=area.querySelector("#flappyScore"), bestEl=area.querySelector("#flappyBest");
  const status=area.querySelector("#flappyStatus");
  const W=canvas.width,H=canvas.height, ground=48, bird={x:105,y:245,r:15};
  let pipes=[], score=0, velocity=0, frame=0, state="ready", raf=0, lastTime=0;
  const gravity=.38, flap=-6.4, pipeW=66, gap=155;

  function reset(){
    cancelAnimationFrame(raf); pipes=[]; score=0; velocity=0; frame=0;
    bird.y=245; state="ready"; lastTime=0;
    scoreEl.textContent="Puan: 0";
    status.textContent="Başlamak ve kanat çırpmak için dokun veya Boşluk tuşuna bas.";
    draw();
  }
  function spawnPipe(){
    const top=75+Math.random()*205;
    pipes.push({x:W+10,top,passed:false});
  }
  function draw(){
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,"#70c9f2"); sky.addColorStop(1,"#d3f3ff");
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Uzak bulutlar
    ctx.fillStyle="#ffffff99";
    [[65,90,28],[265,150,36],[350,65,22]].forEach(([x,y,r])=>{
      ctx.beginPath();ctx.arc(x,y,r*.55,0,Math.PI*2);ctx.arc(x+r*.45,y-8,r*.7,0,Math.PI*2);ctx.arc(x+r,y,r*.5,0,Math.PI*2);ctx.fill();
    });
    pipes.forEach(pipe=>{
      const bottomY=pipe.top+gap;
      const grad=ctx.createLinearGradient(pipe.x,0,pipe.x+pipeW,0);
      grad.addColorStop(0,"#16854b");grad.addColorStop(.5,"#42c66d");grad.addColorStop(1,"#116c40");
      ctx.fillStyle=grad;
      ctx.fillRect(pipe.x,0,pipeW,pipe.top-18);
      ctx.fillRect(pipe.x-5,pipe.top-18,pipeW+10,18);
      ctx.fillRect(pipe.x,bottomY+18,pipeW,H-ground-bottomY-18);
      ctx.fillRect(pipe.x-5,bottomY,pipeW+10,18);
    });
    ctx.fillStyle="#d7b36a";ctx.fillRect(0,H-ground,W,ground);
    ctx.fillStyle="#65b94e";ctx.fillRect(0,H-ground,W,10);
    // Kuş
    ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(Math.max(-.45,Math.min(.75,velocity*.07)));
    ctx.fillStyle="#ffd34e";ctx.beginPath();ctx.ellipse(0,0,17,13,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f29b38";ctx.beginPath();ctx.ellipse(-5,5,9,5,-.4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(7,-5,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#182333";ctx.beginPath();ctx.arc(9,-5,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f0783b";ctx.beginPath();ctx.moveTo(14,1);ctx.lineTo(27,5);ctx.lineTo(14,8);ctx.fill();
    ctx.restore();
    if(state==="ready"||state==="over"){
      ctx.fillStyle="#122033dd";ctx.fillRect(35,205,W-70,112);
      ctx.textAlign="center";ctx.fillStyle="#fff";ctx.font="bold 25px Arial";
      ctx.fillText(state==="ready"?"UÇMAYA HAZIR MISIN?":"OYUN BİTTİ",W/2,250);
      ctx.font="16px Arial";ctx.fillText(state==="ready"?"Dokun veya BOŞLUK'a bas":`Puanın: ${score}`,W/2,282);
    }
  }
  function flapBird(){
    if(state==="over")return;
    if(state==="ready"){state="playing";status.textContent="Harika! Borulara çarpmadan ilerle.";}
    velocity=flap;
  }
  function hitPipe(pipe){
    const withinX=bird.x+bird.r>pipe.x && bird.x-bird.r<pipe.x+pipeW;
    return withinX && (bird.y-bird.r<pipe.top || bird.y+bird.r>pipe.top+gap);
  }
  function endGame(){
    state="over";
    const best=Math.max(score,Number(localStorage.getItem("dreamFlappyBest")||0));
    localStorage.setItem("dreamFlappyBest",best);
    bestEl.textContent=`Rekor: ${best}`;
    status.textContent="Oyun bitti. Yeniden başlatıp tekrar deneyebilirsin.";
  }
  function loop(time){
    if(state!=="playing")return;
    const delta=lastTime?Math.min(2,(time-lastTime)/16.67):1;lastTime=time;
    frame+=delta;velocity+=gravity*delta;bird.y+=velocity*delta;
    if(frame>75 && frame%105<delta)spawnPipe();
    pipes.forEach(pipe=>{
      pipe.x-=2.7*delta;
      if(!pipe.passed && pipe.x+pipeW<bird.x){pipe.passed=true;score++;scoreEl.textContent=`Puan: ${score}`;}
    });
    pipes=pipes.filter(pipe=>pipe.x+pipeW>-10);
    if(bird.y-bird.r<0 || bird.y+bird.r>H-ground || pipes.some(hitPipe))endGame();
    draw();
    if(state==="playing")raf=requestAnimationFrame(loop);
  }
  function action(){
    if(state==="ready"){flapBird();raf=requestAnimationFrame(loop);}
    else if(state==="playing")flapBird();
  }
  function onKey(e){
    if(e.code==="Space"||e.key==="ArrowUp"){
      e.preventDefault();
      if(state==="ready"){action();} else if(state==="playing"){flapBird();}
      else if(state==="over"){reset();}
    }
  }
  function onPointer(e){if(e.target.closest("#flappyRestart"))return; e.preventDefault(); if(state==="ready"){action();}else if(state==="playing"){flapBird();}}
  canvas.addEventListener("pointerdown",onPointer);
  document.addEventListener("keydown",onKey);
  area.querySelector("#flappyRestart").addEventListener("click",reset);
  const observer=new MutationObserver(()=>{
    if(!area.isConnected||!area.querySelector("#flappyCanvas")){
      cancelAnimationFrame(raf);document.removeEventListener("keydown",onKey);
      canvas.removeEventListener("pointerdown",onPointer);observer.disconnect();
    }
  });
  observer.observe(area,{childList:true,subtree:true});
  draw();
}
