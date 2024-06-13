// script.js contains the logic for the Nim game

// Root represents the root of web application
class Root {
  // constructor initializes the game
  constructor() {
    this.game = null;
    this.title_container = null;
    this.input_container = null;
    this.status_container = null;
    this.element = document.getElementById("root");
    if (!this.element) {
      console.error("root not found");
      return;
    }
    this.initialize();
  }

  // initialize initializes the game
  initialize() {
    this.element.innerHTML = "";

    // Create title
    let title = document.createElement("h1");
    title.innerHTML = "Nim Game";
    let title_container = document.createElement("div");
    title_container.id = "title-container";
    this.element.appendChild(title_container);
    title_container.appendChild(title);
    this.element.appendChild(title_container);
    this.title_container = title_container;

    // Create input container
    let btn_start_game = document.createElement("button");
    btn_start_game.innerHTML = "Start Game";
    btn_start_game.addEventListener("click", () => this.#onClickStartGame());
    let btn_end_turn = document.createElement("button");
    btn_end_turn.innerHTML = "End Turn";
    btn_end_turn.addEventListener("click", () => this.#onClickEndTurn());
    let input_container = document.createElement("div");
    input_container.id = "input-container";
    input_container.appendChild(btn_start_game);
    input_container.appendChild(document.createTextNode("\u00A0")); // &nbsp;
    input_container.appendChild(btn_end_turn);
    this.element.appendChild(input_container);
    this.input_container = input_container;

    // Create status container
    let status_container = document.createElement("div");
    status_container.id = "status-container";
    this.element.appendChild(status_container);
    this.status_container = status_container;

    // Create game container
    if (this.game !== null) {
      delete this.game;
    }
    this.game = new NimGame([3, 4, 5], (status) => {
      return this.#updateStatus(status);
    });
    this.element.appendChild(this.game.element);
  }

  // #onClickStartGame is called when the start game button is clicked
  #onClickStartGame() {
    console.log("Starting game");
    this.initialize();
  }

  // #onClickEndTurn is called when the end turn button is clicked
  #onClickEndTurn() {
    console.log("Ending turn");
    if (this.game === null) {
      console.error("Game is not started");
      return;
    }
    this.game.endTurn();
  }

  // #updateStatus updates the status container
  #updateStatus(status) {
    if (!this.status_container) {
      console.error("status-container not found");
      return false;
    }
    this.status_container.innerHTML = status;
    return true;
  }
}

// NimGame represents the Nim game
class NimGame {
  // constructor initializes the game with the number of piles and stones specified
  constructor(n_stones_lst, updateStatus) {
    this.n_stones_lst = n_stones_lst;
    this.element = document.createElement("div");
    this.element.id = "game-container";
    if (!this.element) {
      console.error("game-container not found");
      return;
    }
    this.element.innerHTML = "";
    this.piles = [];
    for (let i = 0; i < n_stones_lst.length; i++) {
      let pile = new Pile(`pile-${i}`, n_stones_lst[i], () => {
        return this.#checkClickedStone(i);
      });
      this.piles.push(pile);
      this.element.appendChild(pile.element);
    }

    this.updateStatus = updateStatus;
    this.player_turn = 0;
    this.updateStatus(`Player Turn: ${this.player_turn}`);
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

    let active_count = 0;
    for (let pile of this.piles) {
      active_count += pile.getActiveCount();
    }
    this.player_turn = (this.player_turn + 1) % 2;
    if (active_count === 0) {
      console.log("Player", this.player_turn, "wins");
      this.updateStatus(`Player ${this.player_turn} wins`);
      return;
    }
    this.updateStatus(`Player Turn: ${this.player_turn}`);
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

  // getActiveCount returns the number of is_active stones
  getActiveCount() {
    let count = 0;
    for (let stone of this.stones) {
      if (stone.is_active) {
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
