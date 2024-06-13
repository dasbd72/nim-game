// script.js contains the logic for the Nim game

// onClickStone is called when a stone is clicked
onClickStone = (pile_id, stone_id) => {
  console.log("Clicked stone", stone_id, "in pile", pile_id);

  stone = document.getElementById(stone_id);
  if (!stone) {
    console.error("Stone not found");
    return;
  }
  stone.classList.toggle("stone-enabled");
  stone.classList.toggle("stone-disabled");
};

// addStone adds a stone to the pile
addStone = (pile, stone_id) => {
  console.log("Adding stone");
  stone = document.createElement("div");
  stone.classList.add("stone");
  stone.classList.add("stone-enabled");
  stone.id = stone_id;
  stone.addEventListener("click", () => onClickStone(pile.id, stone_id));
  pile.appendChild(stone);
};

// addPile adds a pile with n_stones to the game container
addPile = (game_container, pile_id, n_stones) => {
  pile = document.createElement("div");
  pile.classList.add("pile");
  pile.id = pile_id;

  for (let i = 0; i < n_stones; i++) {
    addStone(pile, `${pile_id}-stone-${i}`);
  }
  game_container.appendChild(pile);
};

// initialize initializes the game with the number of piles and stones specified
initialize = (n_stones_lst) => {
  console.log("Initializing game");
  game_container = document.getElementById("game-container");
  if (!game_container) {
    console.error("game-container not found");
    return;
  }
  game_container.innerHTML = "";

  for (let i = 0; i < n_stones_lst.length; i++) {
    addPile(game_container, `pile-${i}`, n_stones_lst[i]);
  }
};

// onClickStartGame is called when the start game button is clicked
// It initializes the game with the number of piles and stones specified by the user
onClickStartGame = () => {
  console.log("Starting game");
  n_stones_lst = [3, 4, 5];
  initialize(n_stones_lst);
};

// setup initializes window elements
setup = () => {
  btn_start_game = document.getElementById("btn-start-game");
  if (!btn_start_game) {
    console.error("btn-start-game not found");
    return;
  }
  btn_start_game.addEventListener("click", onClickStartGame);
};

// main is the entry point of the script
main = () => {
  setup();
};

// Call main when the window is loaded
window.onload = main;
