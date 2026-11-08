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
    <div class="voxel-stage" id="voxelStage"><div class="voxel-crosshair">+</div><div class="voxel-start" id="voxelStart"><h3>Blok Dünyası</h3><p>3 boyutlu dünyayı keşfet ve kendi yapını kur.</p><button id="voxelPlay" class="game-action">Dünyaya gir</button></div></div>
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
    camera.position.set(0,height(0,5)+2.1,7);
    const ray=new THREE.Raycaster(); const center=new THREE.Vector2(0,0);
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    resize(); const ro=new ResizeObserver(resize);ro.observe(stage);
    function look(e){if(!locked)return;yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-1.45,Math.min(1.45,pitch));camera.rotation.set(pitch,yaw,0,"YXZ");}
    renderer.domElement.addEventListener("click",()=>{if(active)renderer.domElement.requestPointerLock?.();});
    document.addEventListener("pointerlockchange",()=>{locked=document.pointerLockElement===renderer.domElement;});
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
    window.addEventListener("keydown",keydown);window.addEventListener("keyup",keyup);
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
      if(!stage.isConnected){cancelAnimationFrame(raf);document.removeEventListener("mousemove",look);window.removeEventListener("keydown",keydown);window.removeEventListener("keyup",keyup);ro.disconnect();return;}
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
    area.querySelectorAll("[data-block]").forEach(b=>b.addEventListener("click",()=>{selected=b.dataset.block;area.querySelectorAll("[data-block]").forEach(x=>x.classList.toggle("selected",x===b));}));
  }).catch(()=>{status.textContent="3D motor yüklenemedi. İnternet bağlantısını kontrol edip tekrar aç.";});
}
