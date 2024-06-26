// script.js contains the logic for the Nim game

// Root represents the root of web application
class Root {
  // constructor initializes the game
  constructor() {
    this.game = null;
    this.is_last_win = true;
    this.is_special = false;
    this.difficulty = 0;
    this.title_container = null;
    this.input_container = null;
    this.status_container = null;
    this.element = document.getElementById("root");
    if (!this.element) {
      console.error("root not found");
      return;
    }

    // Create title
    let title = document.createElement("h1");
    title.innerHTML = "Nim Game";
    let title_container = document.createElement("div");
    title_container.classList.add("title-container");
    this.element.appendChild(title_container);
    title_container.appendChild(title);
    this.element.appendChild(title_container);
    this.title_container = title_container;

    // Create input container
    let win_mode_switch = new ChoiceSwitch(
      "win-mode-switch",
      (choice_index) => {
        this.is_last_win = choice_index === 1;
      },
      [
        "Last <div class='win-lose'>Lose</div>",
        "Last <div class='win-lose'>Win</div>",
      ],
      this.is_last_win ? 1 : 0,
      "win-mode-switch",
      ["switch-last-lose", "switch-last-win"]
    );
    let special_switch = new ChoiceSwitch(
      "special-switch",
      (choice_index) => {
        this.is_special = choice_index === 1;
      },
      ["⚫️", "👨🏼‍🏫"],
      this.is_special ? 1 : 0,
      "special-switch",
      ["switch-normal", "switch-special"]
    );
    let btn_start_game = document.createElement("button");
    btn_start_game.innerHTML = "Start Game";
    btn_start_game.addEventListener("click", () => this.#onClickStartGame(0));
    let difficulty_switch = new ChoiceSwitch(
      "difficulty-switch",
      (choice_index) => {
        this.difficulty = choice_index;
      },
      ["Easy", "Medium", "Hard"],
      this.difficulty,
      "difficulty-switch",
      ["switch-easy", "switch-medium", "switch-hard"]
    );
    let btn_start_game_ai = document.createElement("button");
    btn_start_game_ai.innerHTML = "Start Game AI";
    btn_start_game_ai.addEventListener("click", () =>
      this.#onClickStartGame(1)
    );
    let input_container = document.createElement("div");
    input_container.classList.add("input-container");
    input_container.appendChild(win_mode_switch.element);
    input_container.appendChild(document.createTextNode("\u00A0")); // &nbsp;
    input_container.appendChild(special_switch.element);
    input_container.appendChild(document.createTextNode("\u00A0")); // &nbsp;
    input_container.appendChild(btn_start_game);
    input_container.appendChild(document.createTextNode("\u00A0")); // &nbsp;
    input_container.appendChild(difficulty_switch.element);
    input_container.appendChild(document.createTextNode("\u00A0")); // &nbsp;
    input_container.appendChild(btn_start_game_ai);
    this.element.appendChild(input_container);
    this.input_container = input_container;

    // Create status container
    let status_container = document.createElement("div");
    status_container.classList.add("status-container");
    this.element.appendChild(status_container);
    this.status_container = status_container;

    // Initialize game
    let mode = localStorage.getItem("nim_game_mode");
    if (mode === null) {
      mode = 0;
    }
    this.#initializeGame(mode);
  }

  // #initializeGame initializes the game
  //
  // mode: the mode of the game. 0 for 2 players, 1 for player versus AI
  #initializeGame = (mode) => {
    console.log("Initializing game");
    // Remove game container
    if (this.game !== null) {
      this.element.removeChild(this.game.element);
      delete this.game;
    }
    // Set n_stones_lst based on difficulty
    let n_stones_lst = [];
    if (this.difficulty === 0) {
      n_stones_lst = [3, 4, 5];
    } else if (this.difficulty === 1) {
      n_stones_lst = [5, 7, 9];
    } else if (this.difficulty === 2) {
      n_stones_lst = [3, 5, 7, 9];
    }
    // Create game container
    this.game = new NimGame(
      `game-container`,
      mode,
      this.is_last_win,
      this.is_special,
      n_stones_lst,
      (status) => {
        return this.#updateStatus(status);
      }
    );
    this.element.appendChild(this.game.element);
  };

  // #onClickStartGame is called when the start game button is clicked
  //
  // mode: the mode of the game. 0 for 2 players, 1 for player versus AI
  #onClickStartGame = (mode) => {
    localStorage.setItem("nim_game_mode", mode);
    this.#initializeGame(mode);
  };

  // #updateStatus updates the status container
  //
  // status: the status to update
  #updateStatus = (status) => {
    if (!this.status_container) {
      console.error("status-container not found");
      return false;
    }
    this.status_container.innerHTML = status;
    return true;
  };
}

// NimGame represents the Nim game
class NimGame {
  // constructor initializes the game with the number of piles and stones specified
  //
  // id: the id of the game container
  // mode: the mode of the game. 0 for 2 players, 1 for player versus AI
  // is_last_win: whether the last win mode is enabled
  // is_special: whether the special mode is enabled
  // n_stones_lst: the list of number of stones in each pile
  // updateStatus: the function to update the status
  constructor(id, mode, is_last_win, is_special, n_stones_lst, updateStatus) {
    this.mode = mode;
    this.is_last_win = is_last_win;
    this.n_stones_lst = n_stones_lst;
    this.element = this.#createElement(id);
    this.piles = [];
    for (let i = 0; i < n_stones_lst.length; i++) {
      let pile = new Pile(
        `pile-${i}`,
        is_special,
        n_stones_lst[i],
        (stone_idx) => {
          return this.#chooseStone(i, stone_idx);
        }
      );
      this.piles.push(pile);
      this.element.appendChild(pile.element);
    }
    let btn_end_turn = document.createElement("button");
    btn_end_turn.innerHTML = "End Turn";
    btn_end_turn.addEventListener("click", () => this.#onClickEndTurn());
    this.element.appendChild(btn_end_turn);

    this.updateStatus = updateStatus;
    this.player_turn = 0;
    if (this.mode === 0) {
      this.player_name_lst = ["Player 1", "Player 2"];
    } else {
      this.player_name_lst = ["Player", "Computer"];
    }
    this.updateStatus(`Player Turn: ${this.player_name_lst[this.player_turn]}`);
  }

  // #createElement creates the game container
  //
  // id: the id of the game container
  #createElement = (id) => {
    let element = document.createElement("div");
    element.id = id;
    element.classList.add("game-container");
    return element;
  };

  // #chooseStone chooses a stone in the pile
  //
  // pile_idx: the index of the pile
  // stone_idx: the index of the stone
  #chooseStone = (pile_idx, stone_idx) => {
    if (this.mode === 1 && this.player_turn === 1) {
      console.error("Computer is playing");
      return false;
    }

    for (let i = 0; i < this.piles.length; i++) {
      if (i === pile_idx) {
        continue;
      }
      if (this.piles[i].getChosenCount() > 0) {
        console.error("Cannot choose stones from multiple piles");
        return false;
      }
    }
    this.piles[pile_idx].choose(stone_idx);
  };

  // #computerTurn is called when it is the computer's turn
  #computerTurn = () => {
    // Get active count list of each pile
    let active_count_lst = [];
    let active_count = 0;
    for (let pile of this.piles) {
      let count = pile.getActiveCount();
      active_count_lst.push(count);
      active_count += count;
    }
    if (active_count === 0) {
      console.error("computer: No active stones");
      return;
    }

    // Get optimal move, otherwise get random move
    let [choose_pile_idx, choose_stones_cnt] = this.#getOptimalMove(
      this.is_last_win,
      active_count_lst
    );
    if (choose_pile_idx === -1 || choose_stones_cnt === 0) {
      [choose_pile_idx, choose_stones_cnt] =
        this.#getRandomMove(active_count_lst);
    } else {
      console.log("computer: optimal move");
    }

    // Perform move
    console.log(
      "computer: choose",
      choose_stones_cnt,
      "stones from pile",
      choose_pile_idx
    );
    for (let i = 0; choose_stones_cnt > 0; i++) {
      if (this.piles[choose_pile_idx].stones[i].is_active) {
        this.piles[choose_pile_idx].stones[i].choose();
        choose_stones_cnt -= 1;
      }
    }

    // End turn
    this.#endTurn();
  };

  // #getOptimalMove returns the optimal move given the active count list
  //
  // is_last_win: whether the last win mode is enabled
  // active_count_lst: the list of active counts for each pile
  #getOptimalMove = (is_last_win, active_count_lst) => {
    if (!is_last_win) {
      // try to leave odd number of piles with 1 stone
      let active_eq_1_lst = []; // list of piles with 1 stone
      let active_gt_1_lst = []; // list of piles with more than 1 stone
      for (let i = 0; i < active_count_lst.length; i++) {
        if (active_count_lst[i] === 1) {
          active_eq_1_lst.push(i);
        }
        if (active_count_lst[i] > 1) {
          active_gt_1_lst.push(i);
        }
      }
      if (active_gt_1_lst.length == 1 && active_eq_1_lst.length % 2 === 0) {
        return [active_gt_1_lst[0], active_count_lst[active_gt_1_lst[0]] - 1];
      }
      if (active_gt_1_lst.length == 1 && active_eq_1_lst.length % 2 === 1) {
        return [active_gt_1_lst[0], active_count_lst[active_gt_1_lst[0]]];
      }
      if (active_gt_1_lst.length == 0 && active_eq_1_lst.length % 2 === 0) {
        return [active_eq_1_lst[0], 1];
      }
      if (active_gt_1_lst.length == 0 && active_eq_1_lst.length % 2 === 1) {
        // losing position
        return [-1, 0];
      }
    }

    // get nim sum
    let nim_sum = 0;
    for (let count of active_count_lst) {
      nim_sum ^= count;
    }
    console.log("nim_sum", nim_sum);

    for (let i = 0; i < active_count_lst.length; i++) {
      if (active_count_lst[i] === 0) {
        continue;
      }
      for (let j = 1; j <= active_count_lst[i]; j++) {
        let new_nim_sum =
          nim_sum ^ active_count_lst[i] ^ (active_count_lst[i] - j);
        if (new_nim_sum === 0) {
          return [i, j];
        }
      }
    }
    return [-1, 0];
  };

  // #getRandomMove returns a random move given the active count list
  //
  // active_count_lst: the list of active counts for each pile
  #getRandomMove = (active_count_lst) => {
    let valid_piles = [];
    for (let i = 0; i < active_count_lst.length; i++) {
      if (active_count_lst[i] > 0) {
        valid_piles.push(i);
      }
    }

    if (valid_piles.length === 0) {
      return [-1, 0];
    }

    let choose_pile_idx =
      valid_piles[Math.floor(Math.random() * valid_piles.length)];
    let choose_stones_cnt =
      Math.floor(Math.random() * active_count_lst[choose_pile_idx]) + 1;
    return [choose_pile_idx, choose_stones_cnt];
  };

  // #onClickEndTurn is called when the end turn button is clicked
  #onClickEndTurn = () => {
    this.#endTurn();
  };

  // #endTurn ends the current turn
  #endTurn = () => {
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
    if (active_count === 0) {
      let status;
      if (this.is_last_win) {
        status = `${this.player_name_lst[this.player_turn]} wins`;
      } else {
        status = `${this.player_name_lst[(this.player_turn + 1) % 2]} wins`;
      }
      this.updateStatus(status);
      console.log(`Game Over: ${status}`);
      return;
    }
    this.player_turn = (this.player_turn + 1) % 2;
    this.updateStatus(`Player Turn: ${this.player_name_lst[this.player_turn]}`);

    if (this.mode === 1 && this.player_turn === 1) {
      this.#computerTurn();
    }
  };
}

// Pile represents a pile of stones
class Pile {
  // constructor initializes the pile with n_stones
  //
  // id: the id of the pile
  // is_special: whether the special mode is enabled
  // n_stones: the number of stones in the pile
  // chooseStone: the function to choose a stone
  constructor(id, is_special, n_stones, chooseStone) {
    console.log("Creating pile", id, "with", n_stones, "stones");
    [this.element, this.innerElement] = this.#createElement(id);
    this.stones = [];
    for (let i = 0; i < n_stones; i++) {
      let stone = new Stone(`${id}-stone-${i}`, is_special, () => {
        return chooseStone(i);
      });
      this.stones.push(stone);
      this.innerElement.appendChild(stone.element);
    }
  }

  // #createElement creates a pile with the specified id
  //
  // id: the id of the pile
  #createElement = (id) => {
    let element = document.createElement("div");
    element.classList.add("pile");
    element.id = id;
    let innerElement = document.createElement("div");
    innerElement.classList.add("pile-inner");
    element.appendChild(innerElement);
    return [element, innerElement];
  };

  // getChosenCount returns the number of is_chosen stones
  getChosenCount = () => {
    let count = 0;
    for (let stone of this.stones) {
      if (stone.is_active && stone.is_chosen) {
        count += 1;
      }
    }
    return count;
  };

  // getActiveCount returns the number of is_active stones
  getActiveCount = () => {
    let count = 0;
    for (let stone of this.stones) {
      if (stone.is_active) {
        count += 1;
      }
    }
    return count;
  };

  // choose chooses a stone in the pile
  //
  // stone_idx: the index of the stone
  choose = (stone_idx) => {
    this.stones[stone_idx].choose();
  };

  // endTurn ends the current turn
  endTurn = () => {
    for (let stone of this.stones) {
      stone.endTurn();
    }
  };
}

// Stone represents a stone
class Stone {
  // constructor initializes the stone
  //
  // id: the id of the stone
  // is_special: whether the special mode is enabled
  // chooseStone: the function to choose the stone
  constructor(id, is_special, chooseStone) {
    console.log("Creating stone", id);
    this.element = this.#createElement(id, is_special, chooseStone);
    this.is_active = true;
    this.is_chosen = false;
  }

  // #createElement creates a stone with the specified id
  //
  // id: the id of the stone
  // is_special: whether the special mode is enabled
  // chooseStone: the function to choose the stone
  #createElement = (id, is_special, chooseStone) => {
    let element = document.createElement("div");
    element.classList.add("stone");
    if (is_special) element.classList.add("stone-special");
    element.classList.add("stone-enabled");
    element.id = id;
    element.addEventListener("click", () => this.#onClick(chooseStone));
    return element;
  };

  // #onClick is called when the stone is clicked
  //
  // chooseStone: the function to choose the stone
  #onClick = (chooseStone) => {
    if (!this.is_active) {
      console.error("Stone is not active");
      return;
    }
    chooseStone();
  };

  // choose chooses the stone
  choose = () => {
    if (!this.is_active) {
      console.error("Stone is not active");
      return;
    }
    this.is_chosen = !this.is_chosen;
    this.element.classList.toggle("stone-enabled");
    this.element.classList.toggle("stone-disabled");
  };

  // endTurn ends the current turn
  endTurn = () => {
    if (this.is_chosen) {
      this.is_active = false;
    }
  };
}

// Call main when the window is loaded
window.onload = () => {
  new Root();
};
