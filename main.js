const modal = document.getElementById("gameModal");
const gameArea = document.getElementById("gameArea");
const modalTitle = document.getElementById("modalTitle");
document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll("[data-game]").forEach(button => {
  button.addEventListener("click", () => {
    const game = button.dataset.game;
    gameArea.innerHTML = "";
    if (game === "memory") { modalTitle.textContent = "Hafıza Eşleştirme"; renderMemory(gameArea); }
    if (game === "tictactoe") { modalTitle.textContent = "XOX"; renderTicTacToe(gameArea); }
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("closeModal").focus();
  });
});
function closeGame() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  gameArea.innerHTML = "";
}
document.getElementById("closeModal").addEventListener("click", closeGame);
modal.addEventListener("click", event => { if (event.target === modal) closeGame(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeGame(); });
