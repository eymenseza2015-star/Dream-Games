// Oyunların kodları burada bulunur. Yeni oyunları bu dosyaya ekleyebiliriz.
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
      button.setAttribute("aria-label", opened.includes(index) || matched.includes(index) ? symbol : "Kapalı kart");
      button.disabled = matched.includes(index) || opened.includes(index) || locked;
      button.addEventListener("click", () => flip(index));
      board.appendChild(button);
    });
    status.textContent = `Hamle: ${moves} · Eşleşme: ${matched.length/2}/8`;
    if (matched.length === 16) status.textContent = `Tebrikler! ${moves} hamlede tamamladın.`;
  }
  function flip(index) {
    if (locked || opened.length === 2 || matched.includes(index)) return;
    opened.push(index); draw();
    if (opened.length === 2) {
      moves++; locked = true;
      const [a,b] = opened;
      if (deck[a] === deck[b]) {
        matched.push(a,b); opened = []; locked = false; draw();
      } else {
        setTimeout(() => { opened = []; locked = false; draw(); }, 750);
      }
    }
  }
  area.querySelector("#memoryRestart").addEventListener("click", () => renderMemory(area));
  draw();
}

function renderTicTacToe(area) {
  let cells = Array(9).fill(""), turn = "X", finished = false;
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  area.innerHTML = `<p class="game-status" id="xoxStatus">Sıra: X</p><div class="xox-board" id="xoxBoard"></div><div class="game-actions"><button class="secondary-button" id="xoxRestart">Yeniden başlat</button></div>`;
  const board = area.querySelector("#xoxBoard"), status = area.querySelector("#xoxStatus");
  function draw() {
    board.innerHTML = "";
    cells.forEach((value, i) => {
      const button = document.createElement("button");
      button.className = "xox-cell" + (value === "O" ? " o" : "");
      button.textContent = value;
      button.disabled = !!value || finished;
      button.setAttribute("aria-label", `${i+1}. kare ${value || "boş"}`);
      button.addEventListener("click", () => play(i));
      board.appendChild(button);
    });
  }
  function play(i) {
    if (finished || cells[i]) return;
    cells[i] = turn;
    const winner = wins.find(line => line.every(index => cells[index] === turn));
    if (winner) { finished = true; status.textContent = `${turn} kazandı!`; }
    else if (cells.every(Boolean)) { finished = true; status.textContent = "Berabere!"; }
    else { turn = turn === "X" ? "O" : "X"; status.textContent = `Sıra: ${turn}`; }
    draw();
  }
  area.querySelector("#xoxRestart").addEventListener("click", () => renderTicTacToe(area));
  draw();
}
