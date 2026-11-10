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


// 2048 — ok tuşları, ekrandaki düğmeler veya kaydırma ile oynanır.
function render2048(area) {
  area.innerHTML = `
    <div class="game2048-wrap">
      <div class="game2048-top"><div><strong>2048</strong><p>Birleştir ve 2048'e ulaş!</p></div><div class="game2048-score">Puan <b id="g2048Score">0</b></div></div>
      <div class="game2048-board" id="g2048Board" role="grid" aria-label="2048 oyun tahtası"></div>
      <div class="game2048-controls"><button data-dir="up" aria-label="Yukarı">↑</button><div><button data-dir="left" aria-label="Sola">←</button><button data-dir="down" aria-label="Aşağı">↓</button><button data-dir="right" aria-label="Sağa">→</button></div></div>
      <p class="game2048-status" id="g2048Status">Ok tuşlarını veya düğmeleri kullan.</p>
      <button class="game-action" id="g2048New">Yeni oyun</button>
    </div>`;
  const boardEl=area.querySelector('#g2048Board'), scoreEl=area.querySelector('#g2048Score'), statusEl=area.querySelector('#g2048Status');
  let board,score,over=false,won=false;
  const values=[0,2,4,8,16,32,64,128,256,512,1024,2048,4096];
  function spawn(){const empty=[];board.forEach((v,i)=>{if(!v)empty.push(i)});if(!empty.length)return;const i=empty[Math.floor(Math.random()*empty.length)];board[i]=Math.random()<.9?2:4;}
  function draw(){boardEl.innerHTML=board.map(v=>`<div class="game2048-cell ${v?'v'+Math.min(v,4096):'empty'}" role="gridcell">${v||''}</div>`).join('');scoreEl.textContent=score;}
  function reset(){board=Array(16).fill(0);score=0;over=false;won=false;spawn();spawn();statusEl.textContent='Ok tuşlarını veya düğmeleri kullan.';draw();}
  function move(dir){if(over)return;const before=board.join(',');let gained=0;
    for(let n=0;n<4;n++){
      let ids=[];for(let k=0;k<4;k++){let r,c;if(dir==='left'){r=n;c=k}else if(dir==='right'){r=n;c=3-k}else if(dir==='up'){r=k;c=n}else{r=3-k;c=n}ids.push(r*4+c)}
      let line=ids.map(i=>board[i]).filter(Boolean),out=[];
      for(let i=0;i<line.length;i++){if(line[i]===line[i+1]){let v=line[i]*2;out.push(v);gained+=v;i++}else out.push(line[i])}
      while(out.length<4)out.push(0);ids.forEach((id,i)=>board[id]=out[i]);
    }
    if(before===board.join(','))return;score+=gained;spawn();draw();
    if(!won&&board.includes(2048)){won=true;statusEl.textContent='Harika! 2048 yaptın. Devam edebilirsin!'}
    if(!board.includes(0)&&!canMove()){over=true;statusEl.textContent='Hamle kalmadı. Yeni oyun başlatabilirsin.'}
  }
  function canMove(){for(let r=0;r<4;r++)for(let c=0;c<4;c++){let i=r*4+c;if(c<3&&board[i]===board[i+1]||r<3&&board[i]===board[i+4])return true}return false}
  function onKey(e){const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(d&&area.isConnected){e.preventDefault();move(d)}}
  function onTouchStart(e){const t=e.changedTouches[0];area._g2048Touch=[t.clientX,t.clientY]}
  function onTouchEnd(e){if(!area._g2048Touch)return;const t=e.changedTouches[0],dx=t.clientX-area._g2048Touch[0],dy=t.clientY-area._g2048Touch[1];area._g2048Touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))}
  const keyHandler=e=>onKey(e);document.addEventListener('keydown',keyHandler);
  area.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.dir)));
  area.querySelector('#g2048New').addEventListener('click',reset);
  boardEl.addEventListener('touchstart',onTouchStart,{passive:true});boardEl.addEventListener('touchend',onTouchEnd,{passive:true});
  const obs=new MutationObserver(()=>{if(!area.isConnected||!area.querySelector('#g2048Board')){document.removeEventListener('keydown',keyHandler);obs.disconnect()}});obs.observe(area,{childList:true,subtree:true});
  reset();
}

// Pong — oyuncu soldaki raketi W/S veya ok tuşlarıyla kontrol eder.
function renderPong(area) {
  area.innerHTML=`<div class="pong-wrap"><div class="pong-score"><span> SEN <b id="pongPlayer">0</b></span><span>İLK 5 KAZANIR</span><span>CPU <b id="pongCpu">0</b></span></div><canvas id="pongCanvas" width="640" height="400" aria-label="Pong oyun alanı"></canvas><div class="pong-controls"><button data-pong="up">▲ Yukarı</button><button data-pong="down">▼ Aşağı</button></div><p id="pongStatus">W / S veya ok tuşlarıyla raketi hareket ettir.</p><button class="game-action" id="pongRestart">Yeniden başlat</button></div>`;
  const canvas=area.querySelector('#pongCanvas'),ctx=canvas.getContext('2d'),pScore=area.querySelector('#pongPlayer'),cScore=area.querySelector('#pongCpu'),status=area.querySelector('#pongStatus');
  let py=160,cy=160,bx=320,by=200,vx=4,vy=2.2,ps=0,cs=0,playing=true,raf=0,held={};
  const paddleH=82,paddleW=12,ball=9;
  function resetBall(dir){bx=320;by=200;vx=4*(dir|| (Math.random()>.5?1:-1));vy=(Math.random()-.5)*5;}
  function draw(){ctx.fillStyle='#101b31';ctx.fillRect(0,0,640,400);ctx.setLineDash([10,12]);ctx.strokeStyle='#ffffff55';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(320,0);ctx.lineTo(320,400);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#8c7bff';ctx.fillRect(24,py,paddleW,paddleH);ctx.fillStyle='#39c6d5';ctx.fillRect(604,cy,paddleW,paddleH);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx,by,ball,0,Math.PI*2);ctx.fill();}
  function loop(){if(!playing)return; if(held.ArrowUp||held.KeyW)py-=6;if(held.ArrowDown||held.KeyS)py+=6;py=Math.max(0,Math.min(400-paddleH,py));
    cy+=(by-(cy+paddleH/2))*.075;cy=Math.max(0,Math.min(400-paddleH,cy));bx+=vx;by+=vy;
    if(by<ball||by>400-ball)vy*=-1;
    if(vx<0&&bx-ball<36&&bx-ball>20&&by>py-ball&&by<py+paddleH+ball){vx=Math.abs(vx)*1.05;vy+=((by-(py+paddleH/2))/35)}
    if(vx>0&&bx+ball>604&&bx+ball<620&&by>cy-ball&&by<cy+paddleH+ball){vx=-Math.abs(vx)*1.05;vy+=((by-(cy+paddleH/2))/35)}
    if(bx<0){cs++;cScore.textContent=cs;resetBall(1)}if(bx>640){ps++;pScore.textContent=ps;resetBall(-1)}
    if(ps>=5||cs>=5){playing=false;status.textContent=ps>=5?'Kazandın! Tebrikler!':'CPU kazandı. Bir kez daha dene!';draw();return}draw();raf=requestAnimationFrame(loop);
  }
  function start(){cancelAnimationFrame(raf);py=cy=160;ps=cs=0;pScore.textContent='0';cScore.textContent='0';playing=true;held={};resetBall();status.textContent='W / S veya ok tuşlarıyla raketi hareket ettir.';draw();raf=requestAnimationFrame(loop)}
  function keydown(e){if(['ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();held[e.code]=true}function keyup(e){held[e.code]=false}
  function press(e){held[e.currentTarget.dataset.pong==='up'?'ArrowUp':'ArrowDown']=true}function release(e){held[e.currentTarget.dataset.pong==='up'?'ArrowUp':'ArrowDown']=false}
  document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);
  area.querySelectorAll('[data-pong]').forEach(b=>{b.addEventListener('pointerdown',press);b.addEventListener('pointerup',release);b.addEventListener('pointerleave',release);b.addEventListener('pointercancel',release)});
  area.querySelector('#pongRestart').addEventListener('click',start);
  const obs=new MutationObserver(()=>{if(!area.isConnected||!area.querySelector('#pongCanvas')){cancelAnimationFrame(raf);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);obs.disconnect()}});obs.observe(area,{childList:true,subtree:true});
  start();
}


// Mayın Tarlası
function renderMines(area){
  const N=9,BOMBS=10;let board=[],revealed=[],flags=[],started=false,ended=false,flagMode=false;
  area.innerHTML=`<div class="newgame-wrap"><p class="newgame-status" id="mineStatus">10 mayını bul. İlk açtığın kare güvenlidir.</p><div class="newgame-actions"><button id="mineFlag">🚩 Bayrak modu: Kapalı</button><button id="mineReset">Yeniden başlat</button></div><div class="mine-board" id="mineBoard"></div></div>`;
  const el=area.querySelector('#mineBoard'),st=area.querySelector('#mineStatus'),fb=area.querySelector('#mineFlag');
  function setup(){board=Array(N*N).fill(0);revealed=[];flags=[];started=false;ended=false;flagMode=false;fb.textContent='🚩 Bayrak modu: Kapalı';st.textContent='10 mayını bul. İlk açtığın kare güvenlidir.';draw()}
  function plant(safe){let ids=Array.from({length:N*N},(_,i)=>i).filter(i=>i!==safe).sort(()=>Math.random()-.5).slice(0,BOMBS);ids.forEach(i=>board[i]=-1);for(let i=0;i<N*N;i++)if(board[i]!==-1){let r=Math.floor(i/N),c=i%N;board[i]=neighbors(r,c).filter(j=>board[j]===-1).length}}
  function neighbors(r,c){let a=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){let rr=r+y,cc=c+x;if((x||y)&&rr>=0&&rr<N&&cc>=0&&cc<N)a.push(rr*N+cc)}return a}
  function draw(){el.innerHTML='';for(let i=0;i<N*N;i++){let b=document.createElement('button');b.className='mine-cell'+(revealed.includes(i)?' revealed':'');b.textContent=flags.includes(i)?'🚩':revealed.includes(i)?(board[i]===-1?'💣':board[i]||''):'';if(revealed.includes(i)&&board[i]>0)b.dataset.num=board[i];b.disabled=ended||revealed.includes(i);b.addEventListener('click',()=>act(i));b.addEventListener('contextmenu',e=>{e.preventDefault();toggleFlag(i)});el.appendChild(b)}}
  function toggleFlag(i){if(ended||revealed.includes(i))return;flags=flags.includes(i)?flags.filter(x=>x!==i):[...flags,i];draw();st.textContent=`Bayrak: ${flags.length}/10`}
  function open(i){if(revealed.includes(i)||flags.includes(i))return;revealed.push(i);if(board[i]===0)neighbors(Math.floor(i/N),i%N).forEach(j=>{if(!revealed.includes(j)&&board[j]!==-1)open(j)})}
  function act(i){if(ended)return;if(flagMode){toggleFlag(i);return}if(!started){plant(i);started=true}if(board[i]===-1){revealed.push(i);ended=true;st.textContent='Mayına bastın! Yeniden deneyebilirsin.';board.forEach((v,j)=>{if(v===-1&&!revealed.includes(j))revealed.push(j)})}else{open(i);if(revealed.length===N*N-BOMBS){ended=true;st.textContent='Tebrikler! Bütün güvenli kareleri açtın.'}else st.textContent=`Açılan kare: ${revealed.length} · Bayrak: ${flags.length}/10`}draw()}
  fb.onclick=()=>{flagMode=!flagMode;fb.textContent=`🚩 Bayrak modu: ${flagMode?'Açık':'Kapalı'}`};area.querySelector('#mineReset').onclick=setup;setup();
}

// Taş-Kâğıt-Makas
function renderRPS(area){
 area.innerHTML=`<div class="newgame-wrap rps-wrap"><p class="newgame-status" id="rpsStatus">Hamleni seç!</p><div class="rps-score"><span>Sen <b id="rpsYou">0</b></span><span>Bilgisayar <b id="rpsCpu">0</b></span></div><div class="rps-choices"><button data-rps="Taş">✊<small>Taş</small></button><button data-rps="Kâğıt">✋<small>Kâğıt</small></button><button data-rps="Makas">✌️<small>Makas</small></button></div><p id="rpsResult" class="newgame-status">İlk 5 puana ulaş!</p><button class="game-action" id="rpsReset">Skoru sıfırla</button></div>`;
 let you=0,cpu=0;const s=area.querySelector('#rpsStatus'),res=area.querySelector('#rpsResult'),ys=area.querySelector('#rpsYou'),cs=area.querySelector('#rpsCpu');
 area.querySelectorAll('[data-rps]').forEach(b=>b.onclick=()=>{if(you>=5||cpu>=5)return;let a=b.dataset.rps,opts=['Taş','Kâğıt','Makas'],c=opts[Math.floor(Math.random()*3)];let win=a===c?0:(a==='Taş'&&c==='Makas'||a==='Kâğıt'&&c==='Taş'||a==='Makas'&&c==='Kâğıt'?1:-1);if(win===1)you++;if(win===-1)cpu++;ys.textContent=you;cs.textContent=cpu;res.textContent=`Sen: ${a} · Bilgisayar: ${c} — ${win===0?'Berabere!':win===1?'Bu turu kazandın!':'Bu turu bilgisayar kazandı.'}`;if(you===5||cpu===5)s.textContent=you===5?'Tebrikler, maçı kazandın!':'Bilgisayar maçı kazandı.'});
 area.querySelector('#rpsReset').onclick=()=>{you=cpu=0;ys.textContent=cs.textContent='0';s.textContent='Hamleni seç!';res.textContent='İlk 5 puana ulaş!'}
}

// Tetris
function renderTetris(area){
 area.innerHTML=`<div class="newgame-wrap tetris-wrap"><p class="newgame-status" id="tetrisStatus">← → hareket · ↑ döndür · ↓ hızlandır · Boşluk: düşür</p><div class="tetris-score">Puan: <b id="tetrisScore">0</b></div><canvas id="tetrisCanvas" width="300" height="600"></canvas><div class="newgame-actions"><button id="tetrisStart">Yeniden başlat</button></div></div>`;
 const canvas=area.querySelector('#tetrisCanvas'),ctx=canvas.getContext('2d'),scoreEl=area.querySelector('#tetrisScore'),status=area.querySelector('#tetrisStatus');
 const W=10,H=20,S=30,colors=['','#8c7bff','#39c6d5','#f4b942','#ed6a8b','#65c98c','#e58b48','#a88cf5'];
 const shapes=[[[1,1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1],[1,1]],[[0,1,1],[1,1,0]],[[0,1,0],[1,1,1]],[[1,1,0],[0,1,1]]];
 let grid, piece,score,over,drop=0,last=0,raf=0;
 function newPiece(){let shape=shapes[Math.floor(Math.random()*shapes.length)].map(r=>r.slice());return {shape,x:Math.floor((W-shape[0].length)/2),y:0,color:1+Math.floor(Math.random()*7)}}
 function collision(p){return p.shape.some((row,y)=>row.some((v,x)=>v&&(p.y+y>=H||p.x+x<0||p.x+x>=W||p.y+y>=0&&grid[p.y+y][p.x+x])))}
 function merge(){piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v&&piece.y+y>=0)grid[piece.y+y][piece.x+x]=piece.color}));let kept=grid.filter(r=>r.some(v=>!v));let n=H-kept.length;while(kept.length<H)kept.unshift(Array(W).fill(0));grid=kept;score+=n*n*100;scoreEl.textContent=score;piece=newPiece();if(collision(piece)){over=true;status.textContent='Oyun bitti! Yeniden başlat.'}}
 function draw(){ctx.fillStyle='#101b31';ctx.fillRect(0,0,300,600);for(let y=0;y<H;y++)for(let x=0;x<W;x++)cell(x,y,grid[y][x]);if(piece)piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(piece.x+x,piece.y+y,piece.color)}))}
 function cell(x,y,c){if(!c)return;ctx.fillStyle=colors[c];ctx.fillRect(x*S+1,y*S+1,S-2,S-2);ctx.strokeStyle='#ffffff55';ctx.strokeRect(x*S+2,y*S+2,S-4,S-4)}
 function rotate(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse())}
 function move(dx,dy){if(over)return;let p={...piece,x:piece.x+dx,y:piece.y+dy};if(!collision(p)){piece=p;return true}if(dy===1)merge();return false}
 function key(e){if(!area.isConnected||over)return;let handled=true;if(e.key==='ArrowLeft')move(-1,0);else if(e.key==='ArrowRight')move(1,0);else if(e.key==='ArrowDown')move(0,1);else if(e.key==='ArrowUp'){let p={...piece,shape:rotate(piece.shape)};if(!collision(p))piece=p}else if(e.code==='Space'){while(move(0,1)){} }else handled=false;if(handled){e.preventDefault();draw()}}
 function loop(t){if(!area.isConnected)return;if(!over){let d=t-last;last=t;drop+=d;if(drop>650){move(0,1);drop=0}draw();raf=requestAnimationFrame(loop)}}
 function start(){cancelAnimationFrame(raf);grid=Array.from({length:H},()=>Array(W).fill(0));score=0;over=false;drop=0;last=0;scoreEl.textContent='0';status.textContent='← → hareket · ↑ döndür · ↓ hızlandır · Boşluk: düşür';piece=newPiece();draw();raf=requestAnimationFrame(loop)}
 document.addEventListener('keydown',key);area.querySelector('#tetrisStart').onclick=start;
 const obs=new MutationObserver(()=>{if(!area.isConnected||!area.querySelector('#tetrisCanvas')){cancelAnimationFrame(raf);document.removeEventListener('keydown',key);obs.disconnect()}});obs.observe(area,{childList:true,subtree:true});start();
}


// 3D Blok Dünyası — Three.js tabanlı özgün voxel sandbox
function renderVoxel(area) {
  area.innerHTML = `<div class="voxel-wrap">
    <div class="voxel-hud"><span id="voxelStatus">Dünya hazırlanıyor...</span><span>WASD: hareket · Space: zıpla · Sol tık: kır · Sağ tık: koy</span></div>
    <div class="voxel-stage" id="voxelStage"><div class="voxel-crosshair">+</div><div id="vxDamageFlash" style="position:absolute;inset:0;background:rgba(255,0,0,.0);pointer-events:none;z-index:5;transition:background .12s"></div><div class="voxel-start" id="voxelStart"><h3>Blok Dünyası</h3><p>3 boyutlu dünyayı keşfet ve kendi yapını kur.</p><button id="voxelPlay" class="game-action">Dünyaya gir</button></div></div>
    <div class="voxel-tools"><span>Blok seç:</span><button data-block="grass" class="selected">🟩 Çimen</button><button data-block="dirt">🟫 Toprak</button><button data-block="stone">⬜ Taş</button><button data-block="wood">🪵 Odun</button><button data-block="leaves">🌿 Yaprak</button></div>
    <p class="voxel-tip">Bilgisayarda en iyi deneyim için tam ekran al. Mobilde ekrana dokunarak kontrol desteklenmez.</p>
  </div>`;
  const stage=area.querySelector("#voxelStage"), status=area.querySelector("#voxelStatus");
  let renderer,scene,camera,raf,active=false,selected="grass",yaw=0,pitch=0,locked=false;
  const keys={}; const blocks=new Map(); const materials={grass:0x55a447,dirt:0x805334,stone:0x858b91,wood:0x8b5a2b,leaves:0x2d803d};
  const THREEPromise=import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
  THREEPromise.then(THREE=>{
    if(!stage.isConnected) return;
    scene=new THREE.Scene(); scene.background=new THREE.Color(0x8bc9ef); scene.fog=new THREE.Fog(0x8bc9ef,22,65);
    camera=new THREE.PerspectiveCamera(75,1,0.1,100); camera.position.set(0,4,8);
    renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; stage.prepend(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xd9efff,0x63734c,2));
    const sun=new THREE.DirectionalLight(0xfff2d2,2.2); sun.position.set(-12,20,10); sun.castShadow=true; scene.add(sun);
    const geo=new THREE.BoxGeometry(1,1,1);
    const mats={}; Object.entries(materials).forEach(([k,c])=>mats[k]=new THREE.MeshLambertMaterial({color:c}));
    function add(x,y,z,type){
      const key=`${x},${y},${z}`; if(blocks.has(key)) return;
      const mesh=new THREE.Mesh(geo,mats[type]||mats.grass); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData={x,y,z,type};
      scene.add(mesh); blocks.set(key,mesh);
    }
    function remove(mesh){const d=mesh.userData;scene.remove(mesh);blocks.delete(`${d.x},${d.y},${d.z}`);}
    function height(x,z){return Math.floor(1+Math.sin(x*.38)*1.1+Math.cos(z*.31)*.8);}
    for(let x=-13;x<=13;x++) for(let z=-13;z<=13;z++){
      const h=height(x,z); add(x,h,z,"grass");
      for(let y=h-1;y>=Math.max(-2,h-3);y--) add(x,y,z,y===h-1?"dirt":"stone");
      if(Math.random()<.035 && Math.abs(x)+Math.abs(z)>5){
        for(let y=h+1;y<=h+3;y++) add(x,y,z,"wood");
        for(let dx=-2;dx<=2;dx++) for(let dz=-2;dz<=2;dz++) for(let dy=2;dy<=4;dy++)
          if(Math.abs(dx)+Math.abs(dz)+(dy===4?1:0)<5) add(x+dx,h+dy,z+dz,"leaves");
      }
    }
    // Spawn area is flattened and cleared
    for(let x=-2;x<=2;x++) for(let z=-2;z<=2;z++){const h=height(x,z); for(let y=h+1;y<=h+5;y++){const ob=blocks.get(`${x},${y},${z}`);if(ob)remove(ob);}}
    camera.position.set(0,height(0,0)+2.1,0);
 // First-person hand and held item, attached to the camera.
 const hand=new THREE.Group();hand.position.set(.48,-.42,-.72);camera.add(hand);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(.22,.28,.55),new THREE.MeshLambertMaterial({color:0xc58a62}));arm.position.set(.02,-.12,.02);hand.add(arm);
 const heldGeo=new THREE.BoxGeometry(.22,.22,.22);let heldMesh=new THREE.Mesh(heldGeo,mats.grass);heldMesh.position.set(0,.04,-.28);hand.add(heldMesh);
 let handSwing=0;function refreshHeld(){let mat=mats[selected]||new THREE.MeshLambertMaterial({color:selected==="sword"?0xbfc8d4:selected==="pickaxe"?0x98734b:0x9b754c});heldMesh.material=mat;heldMesh.visible=!["cooked_meat"].includes(selected);if(selected==="sword"){heldMesh.scale.set(.55,2.2,.45);heldMesh.rotation.z=-.55}else if(selected==="pickaxe"){heldMesh.scale.set(1.8,.35,.35);heldMesh.rotation.z=-.5}else heldMesh.scale.set(1,1,1)}
 refreshHeld();
    const ray=new THREE.Raycaster(); const center=new THREE.Vector2(0,0);
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    resize(); const ro=new ResizeObserver(resize);ro.observe(stage);
    function look(e){if(!locked)return;yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-1.45,Math.min(1.45,pitch));camera.rotation.set(pitch,yaw,0,"YXZ");}
    renderer.domElement.addEventListener("click",()=>{if(active)renderer.domElement.requestPointerLock?.();});
    document.addEventListener("pointerlockchange",()=>{locked=document.pointerLockElement===renderer.domElement;if(!locked){for(const k in keys)keys[k]=false;}});
    document.addEventListener("mousemove",look);
    renderer.domElement.addEventListener("contextmenu",e=>e.preventDefault());
    renderer.domElement.addEventListener("mousedown",e=>{
      if(!active||!locked)return; ray.setFromCamera(center,camera); const hits=ray.intersectObjects([...blocks.values()]);
      if(!hits.length||hits[0].distance>6)return; const hit=hits[0],d=hit.object.userData;
      if(e.button===0){if(d.y<=-2)return;remove(hit.object);status.textContent="Blok kırıldı";}
      if(e.button===2){const n=hit.face.normal;const x=d.x+Math.round(n.x),y=d.y+Math.round(n.y),z=d.z+Math.round(n.z);
        if(Math.abs(x-camera.position.x)<1&&Math.abs(z-camera.position.z)<1&&Math.abs(y-camera.position.y)<2)return;
        add(x,y,z,selected);status.textContent="Blok yerleştirildi";}
    });
    function keydown(e){keys[e.code]=true;if(["Space","ArrowUp","ArrowDown"].includes(e.code))e.preventDefault();}
    function keyup(e){keys[e.code]=false;}
    document.addEventListener("keydown",keydown);document.addEventListener("keyup",keyup);
    let vy=0,onGround=false;
    const playerRadius=.29, playerHeight=1.8, eyeHeight=1.6;
    // Oyuncunun ayak-gövde kutusunun bloklarla çarpışmasını denetle.
    function overlapsAt(px,py,pz){
      const minX=px-playerRadius,maxX=px+playerRadius;
      const minY=py-eyeHeight,maxY=minY+playerHeight;
      const minZ=pz-playerRadius,maxZ=pz+playerRadius;
      for(let x=Math.floor(minX-.5);x<=Math.floor(maxX+.5);x++)
        for(let y=Math.floor(minY-.5);y<=Math.floor(maxY+.5);y++)
          for(let z=Math.floor(minZ-.5);z<=Math.floor(maxZ+.5);z++){
            if(!blocks.has(`${x},${y},${z}`))continue;
            if(maxX>x-.5+.001&&minX<x+.5-.001&&maxY>y-.5+.001&&minY<y+.5-.001&&maxZ>z-.5+.001&&minZ<z+.5-.001)return true;
          }
      return false;
    }
    function loop(){
      if(!stage.isConnected){cancelAnimationFrame(raf);document.removeEventListener("mousemove",look);document.removeEventListener("keydown",keydown);document.removeEventListener("keyup",keyup);ro.disconnect();return;}
      raf=requestAnimationFrame(loop);
      if(active){
        const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
        const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
        const move=new THREE.Vector3();
        if(keys.KeyW||keys.ArrowUp)move.add(forward);if(keys.KeyS||keys.ArrowDown)move.sub(forward);
        if(keys.KeyD||keys.ArrowRight)move.add(right);if(keys.KeyA||keys.ArrowLeft)move.sub(right);
        if(move.lengthSq()){
          move.normalize().multiplyScalar(.12);
          const nx=camera.position.x+move.x,nz=camera.position.z+move.z;
          if(!overlapsAt(nx,camera.position.y,camera.position.z))camera.position.x=nx;
          if(!overlapsAt(camera.position.x,camera.position.y,nz))camera.position.z=nz;
        }
        if(keys.Space&&onGround){vy=.19;onGround=false;}
        vy=Math.max(vy-.009,-.35);
        const nextY=camera.position.y+vy;
        if(!overlapsAt(camera.position.x,nextY,camera.position.z)){camera.position.y=nextY;onGround=false;}
        else if(vy<0){
          // Zemine inerken ayakları bloğun üst yüzeyine oturt.
          let safeY=camera.position.y;
          for(let i=0;i<24;i++){const test=safeY-.025;if(overlapsAt(camera.position.x,test,camera.position.z))break;safeY=test;}
          camera.position.y=safeY;vy=0;onGround=true;
        }else{vy=0;}
      }
      renderer.render(scene,camera);
    }
    loop(); status.textContent="Dünya hazır · 729 blok"; 
    area.querySelector("#voxelPlay").addEventListener("click",()=>{active=true;area.querySelector("#voxelStart").style.display="none";renderer.domElement.requestPointerLock?.();status.textContent="Keşfetmeye başla!";});
    area.querySelectorAll("[data-block]").forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.block;refreshHeld();area.querySelectorAll("[data-block]").forEach(x=>x.classList.toggle("selected",x===b));}));
  }).catch(()=>{status.textContent="3D motor yüklenemedi. İnternet bağlantısını kontrol edip tekrar aç.";});
}


// Enhanced survival voxel world: animals, crafting, cooking, health, hunger and inventory.
function renderVoxel(area) {
 area.innerHTML=`<div class="voxel-wrap" style="position:relative">
 <div class="voxel-hud"><span id="vxStatus">Dünya hazırlanıyor...</span><span>WASD hareket · Space zıpla · Sol tık kır/saldır · Sağ tık koy · E envanter</span></div>
 <div class="voxel-stage" id="voxelStage"><div class="voxel-crosshair">+</div><div id="vxDamageFlash" style="position:absolute;inset:0;background:rgba(255,0,0,.0);pointer-events:none;z-index:5;transition:background .12s"></div>
 <div id="vxStart" class="voxel-start"><h3>Blok Dünyası: Hayatta Kalma</h3><p>Keşfet, kaynak topla, eşya üret ve hayvanlarla karşılaş.</p><button id="vxPlay" class="game-action">Dünyaya gir</button></div>
 <div id="vxPanel" style="display:none;position:absolute;inset:5%;z-index:8;background:#101827ee;color:white;border:1px solid #65749a;border-radius:14px;padding:16px;overflow:auto">
 <div style="display:flex;justify-content:space-between;align-items:center"><b>🎒 Envanter ve üretim</b><button id="vxClose">Kapat (E)</button></div>
 <div id="vxInventory" style="margin:12px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:7px"></div>
 <h3>🛠️ Üretim</h3><div id="vxCraft" style="display:flex;flex-wrap:wrap;gap:7px"></div>
 <h3>🍖 Pişirme</h3><p style="font-size:13px">Çiğ et + odun = pişmiş et (3 odun tüketir).</p><button id="vxCook">Eti pişir</button>
 <p style="font-size:12px;opacity:.8">Topladığın kaynaklarla kazma, kılıç, tahta ve kamp ateşi üretebilirsin.</p>
 </div></div>
 <div id="vxVitals" style="display:flex;gap:14px;flex-wrap:wrap;padding:8px;color:white;background:#101827;border-radius:8px;margin-top:6px">❤️ <b id="vxHealth">♥♥♥♥♥♥♥♥♥♥</b>　🍗 <b id="vxHunger">🍗🍗🍗🍗🍗🍗🍗🍗🍗🍗</b>　🌲 <span id="vxDay">Gündüz</span></div>
 <div id="vxHotbar" style="display:flex;gap:5px;flex-wrap:wrap;padding:7px;justify-content:center"></div>
 <div class="voxel-tools"><span>Blok seç:</span><button data-block="grass" class="selected">🟩 Çimen</button><button data-block="dirt">🟫 Toprak</button><button data-block="stone">⬜ Taş</button><button data-block="wood">🪵 Odun</button><button data-block="leaves">🌿 Yaprak</button></div>
 <p class="voxel-tip">E: envanter · Hayvanlara yaklaş ve sol tıkla · Yiyecekleri envanterden kullan. Oyun bilgisayarda önerilir.</p></div>`;
 const stage=area.querySelector("#voxelStage"),status=area.querySelector("#vxStatus");
 let renderer,scene,camera,raf,active=false,selected="grass",yaw=0,pitch=0,locked=false,health=100,hunger=100,day=0,invOpen=false;
 const inventory={grass:8,dirt:8,stone:0,wood:4,leaves:0,raw_meat:0,cooked_meat:0,plank:0,stick:0,pickaxe:0,sword:0,campfire:0};
 const keys={},blocks=new Map(),animals=[]; const colors={grass:0x55a447,dirt:0x805334,stone:0x858b91,wood:0x8b5a2b,leaves:0x2d803d,plank:0xb88950};
 const labels={grass:"Çimen",dirt:"Toprak",stone:"Taş",wood:"Odun",leaves:"Yaprak",raw_meat:"Çiğ et",cooked_meat:"Pişmiş et",plank:"Tahta",stick:"Çubuk",pickaxe:"Kazma",sword:"Kılıç",campfire:"Kamp ateşi"};
 const updateUI=()=>{
  const hp=Math.max(0,health),fullHp=Math.floor(hp/10),halfHp=(hp%10)>=5;
  area.querySelector("#vxHealth").textContent="♥".repeat(fullHp)+(halfHp?"♥":"")+"♡".repeat(10-fullHp-(halfHp?1:0));
  area.querySelector("#vxHealth").style.color="#ff4b62";
  const food=Math.max(0,hunger),fullFood=Math.floor(food/10),halfFood=(food%10)>=5;
  area.querySelector("#vxHunger").textContent="🍗".repeat(fullFood)+(halfFood?"◐":"")+"·".repeat(10-fullFood-(halfFood?1:0));
  area.querySelector("#vxInventory").innerHTML=Object.entries(inventory).filter(([k,v])=>v>0).map(([k,v])=>`<button data-use="${k}" style="padding:8px;background:#293750;color:white;border:1px solid #65749a;border-radius:7px">${labels[k]} × ${v}${["cooked_meat","raw_meat"].includes(k)?" · ye":""}</button>`).join("")||"Envanter boş";
  const slots=["grass","dirt","stone","wood","leaves","plank","stick","pickaxe","sword","cooked_meat"];
  area.querySelector("#vxHotbar").innerHTML=slots.map((k,i)=>`<button data-hot="${k}" style="background:${selected===k?"#647db5":"#202d43"};color:white;border:1px solid #8291ad;border-radius:6px;padding:6px 9px">${i===9?"0":i+1} ${labels[k]} ${inventory[k]||0}</button>`).join("");
 };
 const THREEPromise=import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
 THREEPromise.then(THREE=>{
 if(!stage.isConnected)return;
 scene=new THREE.Scene();scene.background=new THREE.Color(0x8bc9ef);scene.fog=new THREE.Fog(0x8bc9ef,22,65);
 camera=new THREE.PerspectiveCamera(75,1,.1,100);renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));stage.prepend(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xd9efff,0x63734c,2));const sun=new THREE.DirectionalLight(0xfff2d2,2.2);sun.position.set(-12,20,10);scene.add(sun);
 const geo=new THREE.BoxGeometry(1,1,1),mats={};Object.entries(colors).forEach(([k,c])=>mats[k]=new THREE.MeshLambertMaterial({color:c}));
 function add(x,y,z,type){const id=`${x},${y},${z}`;if(blocks.has(id))return;const m=new THREE.Mesh(geo,mats[type]||mats.grass);m.position.set(x,y,z);m.userData={x,y,z,type};scene.add(m);blocks.set(id,m);}
 function remove(m){let d=m.userData;scene.remove(m);blocks.delete(`${d.x},${d.y},${d.z}`);inventory[d.type]=(inventory[d.type]||0)+1;updateUI();}
 const height=(x,z)=>Math.floor(1+Math.sin(x*.38)*1.1+Math.cos(z*.31)*.8);
 for(let x=-14;x<=14;x++)for(let z=-14;z<=14;z++){let h=height(x,z);add(x,h,z,"grass");for(let y=h-1;y>=h-3;y--)add(x,y,z,y===h-1?"dirt":"stone");if(Math.random()<.045&&Math.abs(x)+Math.abs(z)>6){for(let y=h+1;y<=h+3;y++)add(x,y,z,"wood");for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=2;dy<=4;dy++)if(Math.abs(dx)+Math.abs(dz)+(dy===4?1:0)<5)add(x+dx,h+dy,z+dz,"leaves");}}
 for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){let h=height(x,z);for(let y=h+1;y<=h+5;y++){let m=blocks.get(`${x},${y},${z}`);if(m){scene.remove(m);blocks.delete(`${x},${y},${z}`)}}}
 camera.position.set(0,height(0,0)+2.1,0);
 // First-person hand and held item, attached to the camera.
 const hand=new THREE.Group();hand.position.set(.48,-.42,-.72);camera.add(hand);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(.22,.28,.55),new THREE.MeshLambertMaterial({color:0xc58a62}));arm.position.set(.02,-.12,.02);hand.add(arm);
 const heldGeo=new THREE.BoxGeometry(.22,.22,.22);let heldMesh=new THREE.Mesh(heldGeo,mats.grass);heldMesh.position.set(0,.04,-.28);hand.add(heldMesh);
 let handSwing=0;function refreshHeld(){let mat=mats[selected]||new THREE.MeshLambertMaterial({color:selected==="sword"?0xbfc8d4:selected==="pickaxe"?0x98734b:0x9b754c});heldMesh.material=mat;heldMesh.visible=!["cooked_meat"].includes(selected);if(selected==="sword"){heldMesh.scale.set(.55,2.2,.45);heldMesh.rotation.z=-.55}else if(selected==="pickaxe"){heldMesh.scale.set(1.8,.35,.35);heldMesh.rotation.z=-.5}else heldMesh.scale.set(1,1,1)}
 refreshHeld();
 // Friendly voxel animals roam around the clearing.
 const animalMat=new THREE.MeshLambertMaterial({color:0xf1eee0}),pigMat=new THREE.MeshLambertMaterial({color:0xe99aa7});
 function spawnAnimal(x,z,pig=false){let group=new THREE.Group();let body=new THREE.Mesh(new THREE.BoxGeometry(.9,.55,.55),pig?pigMat:animalMat);body.position.y=.55;group.add(body);let head=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.42),pig?pigMat:animalMat);head.position.set(.48,.72,0);group.add(head);let legs=[];for(let dx of [-.25,.25])for(let dz of [-.18,.18]){let leg=new THREE.Mesh(new THREE.BoxGeometry(.14,.4,.14),pig?pigMat:animalMat);leg.position.set(dx,.2,dz);group.add(leg);legs.push(leg)}group.position.set(x,height(Math.round(x),Math.round(z))+.5,z);scene.add(group);animals.push({group,pig,life:2,dir:Math.random()*6.28,walk:0,legs});}
 spawnAnimal(4,3);spawnAnimal(-5,2);spawnAnimal(3,-6,true);spawnAnimal(-6,-4,true);
 const ray=new THREE.Raycaster(),center=new THREE.Vector2(0,0);
 function resize(){let w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}resize();const ro=new ResizeObserver(resize);ro.observe(stage);
 function look(e){if(!locked)return;yaw-=e.movementX*.002;pitch=Math.max(-1.45,Math.min(1.45,pitch-e.movementY*.002));camera.rotation.set(pitch,yaw,0,"YXZ")}
 renderer.domElement.addEventListener("click",()=>{if(active&&!invOpen)renderer.domElement.requestPointerLock?.()});
 document.addEventListener("pointerlockchange",()=>{locked=document.pointerLockElement===renderer.domElement;});
 document.addEventListener("mousemove",look);renderer.domElement.addEventListener("contextmenu",e=>e.preventDefault());
 function overlaps(px,py,pz){let r=.29,bottom=py-1.6,top=bottom+1.8;for(let x=Math.floor(px-r-.5);x<=Math.floor(px+r+.5);x++)for(let y=Math.floor(bottom-.5);y<=Math.floor(top+.5);y++)for(let z=Math.floor(pz-r-.5);z<=Math.floor(pz+r+.5);z++){if(!blocks.has(`${x},${y},${z}`))continue;if(px+r>x-.499&&px-r<x+.499&&top>y-.499&&bottom<y+.499&&pz+r>z-.499&&pz-r<z+.499)return true}return false}
 let vy=0,onGround=false,elapsed=0,fallStartY=camera.position.y,falling=false;
 function useItem(k){if(!inventory[k])return;if(k==="cooked_meat"){inventory[k]--;hunger=Math.min(100,hunger+35);health=Math.min(100,health+8)}else if(k==="raw_meat"){inventory[k]--;hunger=Math.min(100,hunger+12)}else return;updateUI();}
 function openInventory(){invOpen=!invOpen;area.querySelector("#vxPanel").style.display=invOpen?"block":"none";if(invOpen&&document.pointerLockElement)document.exitPointerLock();else if(!invOpen&&active)renderer.domElement.requestPointerLock?.();}
 function craft(item){const recipes={plank:{wood:1},stick:{plank:2},pickaxe:{plank:3,stone:3,stick:2},sword:{plank:2,stone:2,stick:1},campfire:{stone:5,wood:3}};let r=recipes[item];if(!r||!Object.entries(r).every(([k,v])=>inventory[k]>=v))return;Object.entries(r).forEach(([k,v])=>inventory[k]-=v);inventory[item]++;updateUI();status.textContent=labels[item]+" üretildi";}
 const patterns={plank:["🪵","","","","","","","",""],stick:["🪵","","","","🪵","","","",""],pickaxe:["🪨","🪨","🪨","","🪵","","","🪵",""],sword:["🪨","","","","🪨","","","🪵",""],campfire:["🪨","🪨","🪨","🪨","🪵","🪨","🪨","🪨","🪨"]};
 area.querySelector("#vxCraft").innerHTML=["plank","stick","pickaxe","sword","campfire"].map(k=>`<button data-craft="${k}" style="background:#293750;color:white;border:1px solid #65749a;border-radius:8px;padding:8px"><b>${labels[k]}</b><div style="display:grid;grid-template-columns:repeat(3,18px);gap:2px;margin-top:5px">${patterns[k].map(v=>`<span style="background:#111d2c;width:18px;height:18px">${v}</span>`).join("")}</div><small>Üret</small></button>`).join("");
 area.querySelector("#vxInventory").addEventListener("click",e=>{let b=e.target.closest("[data-use]");if(b)useItem(b.dataset.use)});
 area.querySelector("#vxCraft").addEventListener("click",e=>{let b=e.target.closest("[data-craft]");if(b)craft(b.dataset.craft)});
 area.querySelector("#vxCook").onclick=()=>{if(inventory.raw_meat>0&&inventory.wood>=3){inventory.raw_meat--;inventory.wood-=3;inventory.cooked_meat++;updateUI();status.textContent="Et pişirildi!"}else status.textContent="Pişirmek için çiğ et ve 3 odun gerekli."};
 area.querySelector("#vxClose").onclick=openInventory;
 area.querySelector("#vxHotbar").addEventListener("click",e=>{let b=e.target.closest("[data-hot]");if(b){selected=b.dataset.hot;refreshHeld();updateUI()}});
 area.querySelectorAll("[data-block]").forEach(b=>b.onclick=()=>{selected=b.dataset.block;refreshHeld();area.querySelectorAll("[data-block]").forEach(x=>x.classList.toggle("selected",x===b));});
 function keydown(e){keys[e.code]=true;if(e.code==="KeyE"&&active){e.preventDefault();openInventory()}if(e.code.startsWith("Digit")){let arr=["grass","dirt","stone","wood","leaves","plank","stick","pickaxe","sword","cooked_meat"],digit=e.code==="Digit0"?9:Number(e.code.slice(5))-1;if(arr[digit]){selected=arr[digit];refreshHeld();updateUI()}}}
 function keyup(e){keys[e.code]=false}document.addEventListener("keydown",keydown);document.addEventListener("keyup",keyup);
 renderer.domElement.addEventListener("mousedown",e=>{if(!active||!locked||invOpen)return;hand.rotation.x=-.65;setTimeout(()=>{if(hand)hand.rotation.x=0},110);ray.setFromCamera(center,camera);let hit=ray.intersectObjects([...blocks.values(),...animals.flatMap(a=>a.group.children.map(o=>{o.userData.animal=a;return o}))]);if(!hit.length||hit[0].distance>6)return;let obj=hit[0].object;if(obj.userData.animal){let a=obj.userData.animal;if(e.button===0){a.life--;if(a.life<=0){scene.remove(a.group);animals.splice(animals.indexOf(a),1);inventory.raw_meat+=a.pig?2:1;updateUI();status.textContent="Hayvan avlandı: et topladın."}}return}let d=obj.userData;if(e.button===0){if(d.y<=-2)return;remove(obj);status.textContent=labels[d.type]+" toplandı"}else if(e.button===2){let n=hit[0].face.normal,x=d.x+Math.round(n.x),y=d.y+Math.round(n.y),z=d.z+Math.round(n.z);if((inventory[selected]||0)>0&&!overlaps(x,y+1.6,z)){add(x,y,z,selected);inventory[selected]--;updateUI()}}});
 function loop(){if(!stage.isConnected){cancelAnimationFrame(raf);document.removeEventListener("mousemove",look);document.removeEventListener("keydown",keydown);document.removeEventListener("keyup",keyup);ro.disconnect();return}raf=requestAnimationFrame(loop);if(active&&!invOpen){let f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),m=new THREE.Vector3();if(keys.KeyW||keys.ArrowUp)m.add(f);if(keys.KeyS||keys.ArrowDown)m.sub(f);if(keys.KeyD||keys.ArrowRight)m.add(r);if(keys.KeyA||keys.ArrowLeft)m.sub(r);if(m.lengthSq()){m.normalize().multiplyScalar(.12);let nx=camera.position.x+m.x,nz=camera.position.z+m.z;if(!overlaps(nx,camera.position.y,camera.position.z))camera.position.x=nx;if(!overlaps(camera.position.x,camera.position.y,nz))camera.position.z=nz}if(keys.Space&&onGround){vy=.19;onGround=false}vy=Math.max(vy-.009,-.35);let ny=camera.position.y+vy;if(!overlaps(camera.position.x,ny,camera.position.z)){if(vy<0&&!falling){fallStartY=camera.position.y;falling=true}camera.position.y=ny;onGround=false}else if(vy<0){let drop=fallStartY-camera.position.y;if(falling&&drop>4){let damage=Math.min(100,Math.round((drop-3)*2)*5);health=Math.max(0,health-damage);let flash=area.querySelector("#vxDamageFlash");flash.style.background="rgba(255,0,0,.48)";setTimeout(()=>{if(flash.isConnected)flash.style.background="rgba(255,0,0,0)"},260);updateUI();status.textContent="Yüksekten düştün! Can kaybettin."}falling=false;vy=0;onGround=true}else{falling=false;vy=0}
 if(m.lengthSq())hand.position.y=-.42+Math.sin(elapsed*.22)*.018;else hand.position.y=-.42;
 elapsed++;if(elapsed%600===0){hunger=Math.max(0,hunger-2);if(hunger===0)health=Math.max(0,health-2);if(health===0){status.textContent="Bayıldın! Sayfayı yenileyerek yeniden başla."}updateUI()}animals.forEach(a=>{a.walk++;if(a.walk%90===0)a.dir=Math.random()*6.28;let nx=a.group.position.x+Math.cos(a.dir)*.012,nz=a.group.position.z+Math.sin(a.dir)*.012;a.group.position.x=nx;a.group.position.z=nz;a.group.position.y=height(Math.round(nx),Math.round(nz))+.5;a.legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(a.walk*.12+(i%2)*Math.PI)*.55});a.group.rotation.y=-a.dir+Math.PI/2});}
 renderer.render(scene,camera)}
 updateUI();area.querySelector("#vxPlay").onclick=()=>{active=true;area.querySelector("#vxStart").style.display="none";renderer.domElement.requestPointerLock?.();status.textContent="Hayatta kalmaya başla!"};status.textContent="Dünya hazır · Hayvanlar çevrede";loop();
 }).catch(()=>{status.textContent="3D motor yüklenemedi. İnternet bağlantısını kontrol et."});
}



// 3D üçüncü şahıs parkur oyunu
async function renderParkour(area) {
  area.innerHTML = `
    <div class="parkour-shell">
      <div class="parkour-hud">
        <div><strong id="pkLevel">BÖLÜM 1 / 5</strong><span id="pkCheckpoint">Başlangıç</span></div>
        <div class="parkour-stats"><span id="pkTime">Süre: 0.0 sn</span><span id="pkFalls">Düşüş: 0</span><span id="pkCoins">🪙 0 / 20</span></div>
      </div>
      <div class="parkour-stage" id="parkourStage">
        <div class="parkour-message" id="pkMessage">Yükleniyor…</div>
        <div class="parkour-crosshair">＋</div>
      </div>
      <div class="parkour-bottom">
        <span>WASD: Hareket · SPACE: Zıpla · Fare: Kamerayı döndür</span>
        <div class="pk-actions"><button class="secondary-button" id="pkNext" style="display:none">Sonraki bölüm →</button><button class="secondary-button" id="pkRestart">Baştan başla</button></div>
      </div>
      <div class="parkour-touch">
        <div class="pk-dpad"><button data-pk="forward">▲</button><div><button data-pk="left">◀</button><button data-pk="back">▼</button><button data-pk="right">▶</button></div></div>
        <button class="pk-jump" data-pk="jump">ZIPLA</button>
      </div>
    </div>`;
  const stage = area.querySelector("#parkourStage");
  const message = area.querySelector("#pkMessage");
  const timeEl = area.querySelector("#pkTime");
  const fallsEl = area.querySelector("#pkFalls");
  const coinsEl = area.querySelector("#pkCoins");
  const checkpointEl = area.querySelector("#pkCheckpoint");
  const levelEl = area.querySelector("#pkLevel");
  const nextBtn = area.querySelector("#pkNext");
  const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
  if (!area.isConnected) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8bd5ff);
  scene.fog = new THREE.Fog(0x8bd5ff, 35, 115);
  const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 180);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xeaf8ff, 0x60704c, 2.0));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(-12, 25, 15); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -35; sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35; sun.shadow.camera.bottom = -35;
  scene.add(sun);

  const mat = (color, roughness=0.82) => new THREE.MeshStandardMaterial({ color, roughness });
  const grassMat = mat(0x4fb477), edgeMat = mat(0x286b58), stoneMat = mat(0x7b8da3);
  const lavaMat = new THREE.MeshStandardMaterial({ color:0xff542d, emissive:0xc92b08, emissiveIntensity:1.1, roughness:0.45 });
  const goldMat = new THREE.MeshStandardMaterial({ color:0xffd34f, metalness:0.25, roughness:0.35 });
  const platforms = [];
  function platform(x,y,z,w,d,color=0x4fb477, moving=false) {
    // Daha rahat inişler için tüm platformları %25 genişlet ve derinleştir.
    w *= 1.25; d *= 1.25;
    const group = new THREE.Group(); group.position.set(x,y,z); scene.add(group);
    const top = new THREE.Mesh(new THREE.BoxGeometry(w,0.65,d), mat(color));
    top.position.y = -0.32; top.castShadow = true; top.receiveShadow = true; group.add(top);
    const sides = new THREE.Mesh(new THREE.BoxGeometry(w+0.04,0.28,d+0.04), edgeMat);
    sides.position.y = -0.72; group.add(sides);
    const p = { mesh:group, x,y,z,w,d, moving, baseX:x, phase:Math.random()*6.28, prevX:x, prevZ:z };
    platforms.push(p); return p;
  }
  // Başlangıç ve giderek zorlaşan platform parkuru
  platform(0,0,3,9,9,0x55bd7b);
  platform(0,0,-7,5,5,0x54b7a1);
  platform(-4,1,-15,4.5,4.5,0x6dbb82);
  platform(2,2,-23,4,4,0x6aa9d8);
  platform(7,2,-31,4.2,4.2,0x6dbb82,true);
  platform(2,3,-40,4,4,0x6aa9d8);
  platform(-4,4,-49,4,4,0x6dbb82,true);
  platform(2,5,-58,4,4,0x6aa9d8);
  platform(7,5,-67,5,5,0x6dbb82);
  platform(0,6,-77,14,14,0xf0bd50);

  // Toplanabilir altınlar: platformların üzerine ve aralarındaki güvenli geçişlere yerleştirilir.
  const coinMaterial = new THREE.MeshStandardMaterial({color:0xffd52e, metalness:0.72, roughness:0.2, emissive:0x8a5700, emissiveIntensity:0.35});
  const coins = [];
  const coinSpots = [
    [0,1.15,0],[0,1.15,3],[0,1.15,-7],[-1.1,1.15,-7],
    [-4,2.15,-15],[-2.9,2.15,-15],[2,3.15,-23],[3,3.15,-23],
    [7,3.15,-31],[8.1,3.15,-31],[2,4.15,-40],[3.1,4.15,-40],
    [-4,5.15,-49],[-2.9,5.15,-49],[2,6.15,-58],[3.1,6.15,-58],
    [7,6.15,-67],[8.1,6.15,-67],[0,7.15,-77],[1.2,7.15,-77]
  ];
  coinSpots.forEach(([x,y,z],i)=>{
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.34,0.12,10,20),coinMaterial);
    mesh.position.set(x,y,z); mesh.rotation.y=Math.PI/2; mesh.castShadow=true; scene.add(mesh);
    coins.push({mesh,collected:false,phase:i*0.7,baseY:y});
  });
  let coinCount=0;
  function updateCoinHud(){coinsEl.textContent="🪙 "+coinCount+" / "+coins.length;}

  // Uzak dekor adaları ve lav denizi
  const lava = new THREE.Mesh(new THREE.BoxGeometry(100,0.4,120), lavaMat);
  lava.position.set(0,-5,-34); scene.add(lava);
  for(let i=0;i<22;i++){
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5+Math.random()*1.5,0), mat(i%2?0x7b9a9b:0x5b8791));
    rock.position.set((Math.random()-.5)*55,-2-Math.random()*3,-Math.random()*90);
    scene.add(rock);
  }
  // Dönen engel, 5. platforma bağlıdır; platform hareket edince engel de taşınır.
  const spinner = new THREE.Group();
  platforms[4].mesh.add(spinner);
  spinner.position.set(0,1.05,0);
  const spinnerWorldPosition = new THREE.Vector3();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(4.8,0.24,0.30), mat(0xf3a53b));
  beam.castShadow=true; spinner.add(beam);
  for(const x of [-2.1,2.1]){
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.24,12,10), mat(0x783f9d)); orb.position.x=x; spinner.add(orb);
  }
  // Kontrol noktası bayrakları platformlara bağlıdır; hareketli platformlarla birlikte taşınırlar.
  function flagOnPlatform(platformRef) {
    const flagGroup = new THREE.Group();
    flagGroup.position.set(0,0,0);
    platformRef.mesh.add(flagGroup);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,3,8), stoneMat);
    pole.position.set(0,1.5,0); flagGroup.add(pole);
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.25,0.72,0.08), goldMat);
    cloth.position.set(0.62,2.45,0); flagGroup.add(cloth);
    return flagGroup;
  }
  const checkpointFlags = [flagOnPlatform(platforms[2]), flagOnPlatform(platforms[6])];
  // Bitiş kemeri
  const goal = new THREE.Group(); goal.position.set(0,6,-80.5); scene.add(goal);
  const goalMat = new THREE.MeshStandardMaterial({color:0xffe36e,emissive:0x8a5c08,emissiveIntensity:0.7});
  for(const [x,y] of [[-2.5,1.8],[2.5,1.8],[0,3.6]]){
    const piece = new THREE.Mesh(new THREE.BoxGeometry(x===0?5.3:0.35,x===0?0.35:3.6,0.35),goalMat);
    piece.position.set(x,y,0); goal.add(piece);
  }

  // Beş ayrı parkur düzeni: her bölümde platform yerleşimi ve zorluk artar.
  const levelLayouts = [
    [[0,0,3],[0,0,-7],[-4,1,-15],[2,2,-23],[7,2,-31],[2,3,-40],[-4,4,-49],[2,5,-58],[7,5,-67],[0,6,-77]],
    [[0,0,3],[4,0,-6],[-2,1,-14],[5,2,-22],[-3,2,-30],[3,3,-39],[7,4,-48],[0,5,-57],[-5,5,-66],[0,6,-77]],
    [[0,0,3],[-4,0,-6],[2,1,-14],[-5,2,-22],[3,3,-30],[-3,3,-39],[5,4,-48],[-2,5,-57],[4,6,-66],[0,7,-77]],
    [[0,0,3],[4,1,-6],[-3,2,-14],[4,3,-22],[-4,4,-30],[3,5,-39],[-5,6,-48],[2,7,-57],[6,8,-66],[0,9,-77]],
    [[0,0,3],[-4,1,-6],[4,2,-14],[-5,3,-22],[5,4,-30],[-4,5,-39],[5,6,-48],[-3,7,-57],[4,8,-66],[0,10,-77]]
  ];
  const movingPatterns = [[4,6],[3,5,7],[2,4,6,8],[1,3,5,7],[1,2,4,6,8]];
  let currentLevel = 0;
  function applyLevel(index){
    currentLevel = index;
    const layout = levelLayouts[index];
    platforms.forEach((p,i)=>{
      const [x,y,z] = layout[i];
      p.x=x; p.y=y; p.z=z; p.baseX=x;
      p.mesh.position.set(x,y,z);
      p.moving = movingPatterns[index].includes(i);
    });
    coins.forEach((c,i)=>{
      const platformIndex = Math.floor(i/2);
      const [x,y,z] = layout[platformIndex];
      const offset = i%2===0 ? -0.65 : 0.65;
      c.mesh.position.set(x+offset,y+1.15,z);
      c.baseY=y+1.15;
      c.collected=false; c.mesh.visible=true;
    });
    coinCount=0; updateCoinHud();
    // Dönen engel platform[4] çocuğu olduğu için yerel konumu sabit kalır.
    spinner.position.set(0,1.05,0);
    goal.position.set(layout[9][0],layout[9][1],layout[9][2]-3.5);
    levelEl.textContent="BÖLÜM "+(index+1)+" / 5";
    checkpoint={x:layout[0][0],y:layout[0][1],z:layout[0][2]};
    checkpointEl.textContent="Başlangıç";
    cp1Reached=false; cp2Reached=false;
    nextBtn.style.display="none";
    message.classList.remove("celebration");
    player.position.set(layout[0][0],layout[0][1],layout[0][2]);
    velocityY=0; falls=0; fallsEl.textContent="Düşüş: 0";
    startTime=performance.now(); won=false; active=true;
    setMessage("Bölüm "+(index+1)+" başladı! Hedefe ulaş ve 20 altını topla.",true);
    setTimeout(()=>setMessage("",false),1800);
  }

  // Basit, özgün blok karakter
  const player = new THREE.Group(); scene.add(player);
  const skin=mat(0xf1bd91), shirt=mat(0x375fbd), pants=mat(0x28364f), shoe=mat(0x202633);
  function cube(parent,w,h,d,material,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  cube(player,0.72,0.82,0.38,shirt,0,1.18,0);
  cube(player,0.48,0.48,0.45,skin,0,1.88,0);
  const leftLeg=new THREE.Group(), rightLeg=new THREE.Group();
  leftLeg.position.set(-0.2,0.82,0); rightLeg.position.set(0.2,0.82,0);
  player.add(leftLeg,rightLeg);
  cube(leftLeg,0.27,0.78,0.3,pants,0,-0.38,0); cube(leftLeg,0.3,0.18,0.42,shoe,0,-0.78,-0.04);
  cube(rightLeg,0.27,0.78,0.3,pants,0,-0.38,0); cube(rightLeg,0.3,0.18,0.42,shoe,0,-0.78,-0.04);
  const leftArm=new THREE.Group(), rightArm=new THREE.Group();
  leftArm.position.set(-0.48,1.48,0); rightArm.position.set(0.48,1.48,0); player.add(leftArm,rightArm);
  cube(leftArm,0.23,0.78,0.27,shirt,0,-0.36,0); cube(rightArm,0.23,0.78,0.27,shirt,0,-0.36,0);
  player.position.set(0,0,3);

  let cp1Reached=false, cp2Reached=false;
  const keys={}; let yaw=0, pitch=0.16, velocityY=0, grounded=false, active=true, won=false;
  let checkpoint={x:0,y:0,z:3}, falls=0, startTime=performance.now(), last=performance.now(), walk=0;
  const moveSpeed=7.2, playerRadius=0.38, playerHeight=2.35;
  const clock=new THREE.Clock();
  function resize(){const w=Math.max(320,stage.clientWidth),h=Math.max(300,stage.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
  resize(); const ro=new ResizeObserver(resize); ro.observe(stage);
  function setMessage(text,show=true){message.textContent=text;message.classList.toggle("show",show);}
  setMessage("WASD ile ilerle, SPACE ile zıpla. Fareyi sürükleyerek kamerayı döndür.",true);
  let helpTimer=setTimeout(()=>setMessage("",false),4200);
  function respawn(){
    player.position.set(checkpoint.x,checkpoint.y,checkpoint.z);
    velocityY=0; grounded=false;
    falls++; fallsEl.textContent="Düşüş: "+falls;
  }
  function restart(){
    applyLevel(0);
    setMessage("Hadi başlayalım!",true); setTimeout(()=>setMessage("",false),1000);
  }
  function nextLevel(){
    if(currentLevel<4) applyLevel(currentLevel+1);
  }
  area.querySelector("#pkRestart").addEventListener("click",restart);
  nextBtn.addEventListener("click",nextLevel);
  applyLevel(0);
  // Mouse sürükleme ile kamera; pointer lock gerektirmez.
  let dragging=false,lastX=0,lastY=0;
  renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
  renderer.domElement.addEventListener("pointerup",()=>dragging=false);
  renderer.domElement.addEventListener("pointercancel",()=>dragging=false);
  renderer.domElement.addEventListener("pointermove",e=>{
    if(!dragging)return;
    yaw-=(e.clientX-lastX)*0.006;
    pitch=Math.max(-0.05,Math.min(0.65,pitch+(e.clientY-lastY)*0.003));
    lastX=e.clientX;lastY=e.clientY;
  });
  function keyDown(e){
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();
    keys[e.code]=true;
    if(e.code==="Space"&&grounded&&active){velocityY=9.2;grounded=false;}
  }
  function keyUp(e){keys[e.code]=false;}
  window.addEventListener("keydown",keyDown); window.addEventListener("keyup",keyUp);
  area.querySelectorAll("[data-pk]").forEach(btn=>{
    const k=btn.dataset.pk, code={forward:"KeyW",back:"KeyS",left:"KeyA",right:"KeyD",jump:"Space"}[k];
    const on=ev=>{ev.preventDefault();keys[code]=true;if(k==="jump"&&grounded&&active){velocityY=9.2;grounded=false;}};
    const off=ev=>{ev.preventDefault();keys[code]=false;};
    btn.addEventListener("pointerdown",on);btn.addEventListener("pointerup",off);btn.addEventListener("pointerleave",off);btn.addEventListener("pointercancel",off);
  });

  function update(dt,now){
    if(!active)return;
    spinner.rotation.y+=dt*1.45;
    coins.forEach(c=>{
      if(c.collected)return;
      c.mesh.rotation.y+=dt*2.8;
      // Altınları sabit başlangıç yüksekliği çevresinde hafifçe yüzdür.
      c.mesh.position.y = c.baseY + Math.sin(now*0.003+c.phase)*0.12;

      // Karakterin ayak noktası yerine gövde merkeziyle mesafe ölç.
      const dx = player.position.x - c.mesh.position.x;
      const dz = player.position.z - c.mesh.position.z;
      const playerCenterY = player.position.y + 1.15;
      const dy = playerCenterY - c.mesh.position.y;
      if(Math.hypot(dx, dy, dz) < 1.45){
        c.collected=true;c.mesh.visible=false;coinCount++;updateCoinHud();
        setMessage("Altın topladın! +1 🪙",true);setTimeout(()=>setMessage("",false),650);
      }
    });
    platforms.forEach(p=>{
      p.prevX=p.mesh.position.x;p.prevZ=p.mesh.position.z;
      if(p.moving)p.mesh.position.x=p.baseX+Math.sin(now*0.0012+p.phase)*2.0;
    });
    const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
    const side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
    const len=Math.hypot(forward,side)||1;
    const fx=-Math.sin(yaw), fz=-Math.cos(yaw), rx=Math.cos(yaw), rz=-Math.sin(yaw);
    const dx=(fx*forward+rx*side)/len*moveSpeed*dt;
    const dz=(fz*forward+rz*side)/len*moveSpeed*dt;
    player.position.x+=dx;player.position.z+=dz;
    if(Math.abs(dx)+Math.abs(dz)>0.001){
      player.rotation.y=Math.atan2(dx,dz);
      walk+=dt*11;leftLeg.rotation.x=Math.sin(walk)*0.65;rightLeg.rotation.x=-Math.sin(walk)*0.65;
      leftArm.rotation.x=-Math.sin(walk)*0.42;rightArm.rotation.x=Math.sin(walk)*0.42;
    }else{leftLeg.rotation.x*=0.8;rightLeg.rotation.x*=0.8;leftArm.rotation.x*=0.8;rightArm.rotation.x*=0.8;}
    const oldY=player.position.y;
    velocityY-=22*dt;player.position.y+=velocityY*dt;grounded=false;
    // Platform üst yüzeyine iniş kontrolü
    for(const p of platforms){
      const px=p.mesh.position.x,pz=p.mesh.position.z;
      const within=Math.abs(player.position.x-px)<p.w/2+playerRadius && Math.abs(player.position.z-pz)<p.d/2+playerRadius;
      const top=p.y;
      if(within&&velocityY<=0&&oldY>=top-0.05&&player.position.y<=top+0.12){
        player.position.y=top;velocityY=0;grounded=true;
        if(p.moving){player.position.x+=p.mesh.position.x-p.prevX;player.position.z+=p.mesh.position.z-p.prevZ;}
      }
    }
    // Dönen çubuğa temas: çubuğun o anki açısına göre çarpışma kontrolü.
    spinner.getWorldPosition(spinnerWorldPosition);
    const sx=player.position.x-spinnerWorldPosition.x;
    const sz=player.position.z-spinnerWorldPosition.z;
    const beamAngle=spinner.rotation.y;
    const beamLocalX=sx*Math.cos(beamAngle)-sz*Math.sin(beamAngle);
    const beamLocalZ=sx*Math.sin(beamAngle)+sz*Math.cos(beamAngle);
    const beamVertical=Math.abs((player.position.y+0.95)-spinnerWorldPosition.y);
    if(Math.abs(beamLocalX)<2.55&&Math.abs(beamLocalZ)<0.58&&beamVertical<1.55){
      // Engel çarpması son etkin kontrol noktasına; yoksa bölüm başlangıcına döndürür.
      respawn();
      setMessage(checkpointEl.textContent==="Başlangıç"
        ? "DÖNEN ENGEL! Başlangıca döndün."
        : "DÖNEN ENGEL! Son kontrol noktasına döndün.",true);
      setTimeout(()=>setMessage("",false),1100);
    }
    // Kontrol noktaları
    const cpA=levelLayouts[currentLevel][2], cpB=levelLayouts[currentLevel][6];
    if(!cp1Reached&&Math.abs(player.position.x-cpA[0])<2.2&&Math.abs(player.position.z-cpA[2])<2.2){
      cp1Reached=true;checkpoint={x:cpA[0],y:cpA[1],z:cpA[2]};checkpointEl.textContent="Kontrol noktası 1";
      setMessage("Kontrol noktası kaydedildi!",true);setTimeout(()=>setMessage("",false),1200);
    }
    if(!cp2Reached&&Math.abs(player.position.x-cpB[0])<2.2&&Math.abs(player.position.z-cpB[2])<2.2){
      cp2Reached=true;checkpoint={x:cpB[0],y:cpB[1],z:cpB[2]};checkpointEl.textContent="Kontrol noktası 2";
      setMessage("Kontrol noktası kaydedildi!",true);setTimeout(()=>setMessage("",false),1200);
    }
    if(player.position.y < -4.1)respawn();
    if(player.position.z < goal.position.z+0.9&&Math.abs(player.position.x-goal.position.x)<4&&player.position.y>goal.position.y-0.8&&!won){
      won=true;active=false;
      if(currentLevel<4){
        setMessage("BÖLÜM "+(currentLevel+1)+" TAMAMLANDI! 🎉 "+coinCount+"/"+coins.length+" altın topladın. Sonraki bölüme geçebilirsin.",true);
        nextBtn.style.display="inline-flex";
      }else{
        message.classList.add("celebration");
        setMessage("🎉✨ TEBRİKLER! ✨🎉\n🏆 5 BÖLÜMÜN TAMAMINI BİTİRDİN! 🏆\nHarika bir parkur başarısı!\n🪙 "+coinCount+"/"+coins.length+" altın topladın. 🎊",true);
        nextBtn.style.display="none";
      }
    }
  }
  function animate(now){
    if(!area.isConnected){cleanup();return;}
    const dt=Math.min(0.035,(now-last)/1000);last=now;
    update(dt,now);
    timeEl.textContent="Süre: "+((now-startTime)/1000).toFixed(1)+" sn";
    const target=new THREE.Vector3(player.position.x,player.position.y+1.25,player.position.z);
    const distance=8.5, height=3.8;
    const desired=new THREE.Vector3(target.x+Math.sin(yaw)*distance,target.y+height+pitch*4,target.z+Math.cos(yaw)*distance);
    camera.position.lerp(desired,1-Math.pow(0.001,dt));camera.lookAt(target);
    renderer.render(scene,camera);
    raf=requestAnimationFrame(animate);
  }
  let raf=requestAnimationFrame(animate);
  function cleanup(){
    active=false;cancelAnimationFrame(raf);clearTimeout(helpTimer);ro.disconnect();
    window.removeEventListener("keydown",keyDown);window.removeEventListener("keyup",keyUp);
    renderer.dispose();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});
    if(renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);
    if(window.__parkourCleanup===cleanup)window.__parkourCleanup=null;
  }
  window.__parkourCleanup=cleanup;
}
