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
  }

  // onClickStartGame is called when the start game button is clicked
  onClickStartGame() {
    console.log("Starting game");
    this.game = new NimGame([3, 4, 5]);
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
      let pile = new Pile(`pile-${i}`, n_stones_lst[i]);
      this.piles.push(pile);
      this.game_container.appendChild(pile.element);
    }
  }
}

// Pile represents a pile of stones
class Pile {
  // constructor initializes the pile with n_stones
  constructor(id, n_stones) {
    console.log("Creating pile", id, "with", n_stones, "stones");
    this.element = this.#createElement(id);
    this.stones = [];
    for (let i = 0; i < n_stones; i++) {
      let stone = new Stone(`${id}-stone-${i}`);
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
}

// Stone represents a stone
class Stone {
  // constructor initializes the stone
  constructor(id) {
    console.log("Creating stone", id);
    this.element = this.#createElement(id);
  }

  // #createElement creates a stone with the specified id
  #createElement = (id) => {
    let element = document.createElement("div");
    element = document.createElement("div");
    element.classList.add("stone");
    element.classList.add("stone-enabled");
    element.id = id;
    element.addEventListener("click", () => this.#onClick());
    return element;
  };

  // #onClick is called when the stone is clicked
  #onClick() {
    console.log("Clicked stone", this.element.id);
    this.element.classList.toggle("stone-enabled");
    this.element.classList.toggle("stone-disabled");
  }
}

// Call main when the window is loaded
window.onload = () => {
  new Root();
};
