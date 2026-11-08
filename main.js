const modal = document.getElementById("gameModal");
const gameArea = document.getElementById("gameArea");
const modalTitle = document.getElementById("modalTitle");
document.getElementById("year").textContent = new Date().getFullYear();
document.querySelectorAll("[data-game]").forEach(button => {
  button.addEventListener("click", () => {
    const game = button.dataset.game; gameArea.innerHTML = "";
    if (game === "race") { modalTitle.textContent = "Turbo Yarış"; renderRace(gameArea); }
    if (game === "memory") { modalTitle.textContent = "Hafıza Eşleştirme"; renderMemory(gameArea); }
    if (game === "tictactoe") { modalTitle.textContent = "XOX"; renderTicTacToe(gameArea); }
    if (game === "snake") { modalTitle.textContent = "Yılan Oyunu"; renderSnake(gameArea); }
    if (game === "flappy") { modalTitle.textContent = "Uçan Kuş"; renderFlappy(gameArea); }
    if (game === "2048") { modalTitle.textContent = "2048"; render2048(gameArea); }
    if (game === "pong") { modalTitle.textContent = "Pong"; renderPong(gameArea); }
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.getElementById("closeModal").focus();
  });
});
function closeGame() { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); gameArea.innerHTML = ""; }
document.getElementById("closeModal").addEventListener("click", closeGame);
modal.addEventListener("click", event => { if (event.target === modal) closeGame(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeGame(); });


// Oyun kütüphanesi: arama ve kategori filtreleri
const searchInput = document.getElementById("gameSearch");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const gameCards = [...document.querySelectorAll(".game-card")];
const searchResult = document.getElementById("searchResult");
const gameGrid = document.querySelector(".game-grid");
let activeCategory = "all";
const noGamesMessage = document.createElement("div");
noGamesMessage.className = "no-games";
noGamesMessage.hidden = true;
noGamesMessage.innerHTML = "<strong>Aradığın oyun bulunamadı.</strong>Başka bir oyun adı veya kategori deneyebilirsin.";
gameGrid.appendChild(noGamesMessage);
function filterGames() {
  const term = (searchInput.value || "").trim().toLocaleLowerCase("tr-TR");
  let visible = 0;
  gameCards.forEach(card => {
    const category = card.dataset.category || "";
    const searchableText = card.innerText.toLocaleLowerCase("tr-TR");
    const show = (activeCategory === "all" || category === activeCategory) && (!term || searchableText.includes(term));
    card.hidden = !show;
    if (show) visible++;
  });
  noGamesMessage.hidden = visible !== 0;
  searchResult.textContent = term || activeCategory !== "all" ? `${visible} oyun bulundu` : "";
  const count = document.querySelector(".game-count");
  if (count) count.textContent = `Şu an ${visible} oyun`;
}
filterButtons.forEach(button => button.addEventListener("click", () => {
  activeCategory = button.dataset.filter;
  filterButtons.forEach(item => { const selected = item === button; item.classList.toggle("active", selected); item.setAttribute("aria-pressed", String(selected)); });
  filterGames();
}));
searchInput.addEventListener("input", filterGames);
document.addEventListener("keydown", event => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { event.preventDefault(); searchInput.focus(); }
});
