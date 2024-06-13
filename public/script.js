// script.js contains the logic for the Nim game

// Root represents the root of web application
class Root {
  // constructor initializes the game
  constructor() {
    this.game = null;
    this.btn_start_game = document.getElementById("btn-start-game");
    if (!this.btn_start_game) {
      console.error("btn-start-game not found");
      return;
    }
    this.btn_start_game.addEventListener("click", () =>
      this.onClickStartGame()
    );

    this.btn_end_turn = document.getElementById("btn-end-turn");
    if (!this.btn_end_turn) {
      console.error("btn-end-turn not found");
      return;
    }
    this.btn_end_turn.addEventListener("click", () => this.onClickEndTurn());
  }

  // onClickStartGame is called when the start game button is clicked
  onClickStartGame() {
    console.log("Starting game");
    this.game = new NimGame([3, 4, 5]);
  }

  // onClickEndTurn is called when the end turn button is clicked
  onClickEndTurn() {
    console.log("Ending turn");
    if (this.game === null) {
      console.error("Game is not started");
      return;
    }
    this.game.endTurn();
  }
}

// NimGame represents the Nim game
class NimGame {
  // constructor initializes the game with the number of piles and stones specified
  constructor(n_stones_lst) {
    this.n_stones_lst = n_stones_lst;
    this.game_container = document.getElementById("game-container");
    if (!this.game_container) {
      console.error("game-container not found");
      return;
    }
    this.game_container.innerHTML = "";
    this.piles = [];
    for (let i = 0; i < n_stones_lst.length; i++) {
      let pile = new Pile(`pile-${i}`, n_stones_lst[i], () => {
        return this.#checkClickedStone(i);
      });
      this.piles.push(pile);
      this.game_container.appendChild(pile.element);
    }

    this.status_container = document.getElementById("status-container");
    if (!this.status_container) {
      console.error("status-container not found");
      return;
    }
    this.player_turn = 0;
    this.status_container.innerHTML = `Player Turn: ${this.player_turn}`;
  }

  // #checkClickedStone checks if a stone in a pile can be clicked
  //
  // pile_idx: the index of the pile
  #checkClickedStone(pile_idx) {
    for (let i = 0; i < this.piles.length; i++) {
      if (i === pile_idx) {
        continue;
      }
      if (this.piles[i].getChosenCount() > 0) {
        console.error("Cannot choose stones from multiple piles");
        return false;
      }
    }
    return true;
  }

  // endTurn ends the current turn
  endTurn() {
    let chosen_count = 0;
    for (let pile of this.piles) {
      chosen_count += pile.getChosenCount();
    }
    if (chosen_count === 0) {
      console.error("No stones are chosen");
      return;
    }
    for (let pile of this.piles) {
      pile.endTurn();
    }
    this.player_turn = (this.player_turn + 1) % 2;
    this.status_container.innerHTML = `Player Turn: ${this.player_turn}`;
  }
}

// Pile represents a pile of stones
class Pile {
  // constructor initializes the pile with n_stones
  //
  // id: the id of the pile
  // n_stones: the number of stones in the pile
  // checkClickedStone: a function that checks if a stone can be clicked
  constructor(id, n_stones, checkClickedStone) {
    console.log("Creating pile", id, "with", n_stones, "stones");
    this.element = this.#createElement(id);
    this.stones = [];
    for (let i = 0; i < n_stones; i++) {
      let stone = new Stone(`${id}-stone-${i}`, () => {
        return checkClickedStone();
      });
      this.stones.push(stone);
      this.element.appendChild(stone.element);
    }
  }

  // #createElement creates a pile with the specified id
  #createElement = (id) => {
    let element = document.createElement("div");
    element.classList.add("pile");
    element.id = id;
    return element;
  };

  // getChosenCount returns the number of is_chosen stones
  getChosenCount() {
    let count = 0;
    for (let stone of this.stones) {
      if (stone.is_active && stone.is_chosen) {
        count += 1;
      }
    }
    return count;
  }

  // endTurn ends the current turn
  endTurn() {
    for (let stone of this.stones) {
      stone.endTurn();
    }
  }
}

// Stone represents a stone
class Stone {
  // constructor initializes the stone
  //
  // id: the id of the stone
  // checkClickedStone: a function that checks if a stone can be clicked
  constructor(id, checkClickedStone) {
    console.log("Creating stone", id);
    this.element = this.#createElement(id, checkClickedStone);
    this.is_active = true;
    this.is_chosen = false;
  }

  // #createElement creates a stone with the specified id
  #createElement = (id, checkClickedStone) => {
    let element = document.createElement("div");
    element = document.createElement("div");
    element.classList.add("stone");
    element.classList.add("stone-enabled");
    element.id = id;
    element.addEventListener("click", () => this.#onClick(checkClickedStone));
    return element;
  };

  // #onClick is called when the stone is clicked
  #onClick(checkClickedStone) {
    if (!this.is_active) {
      return;
    }
    if (!checkClickedStone()) {
      return;
    }
    console.log("Clicked stone", this.element.id);
    this.is_chosen = !this.is_chosen;
    this.element.classList.toggle("stone-enabled");
    this.element.classList.toggle("stone-disabled");
  }

  // endTurn ends the current turn
  endTurn() {
    if (this.is_chosen) {
      this.is_active = false;
    }
  }
}

// Call main when the window is loaded
window.onload = () => {
  new Root();
};
