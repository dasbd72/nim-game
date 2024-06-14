class Switch {
  // constructor initializes the switch
  //
  // id: the id of the switch
  // onSwitch: the function to execute when the switch is clicked
  constructor(id, onSwitch, is_on = false) {
    console.log("Creating switch", id);
    this.element = this.#createElement(id, onSwitch);
    this.is_on = is_on;
  }

  // #createElement creates a switch with the specified id
  //
  // id: the id of the switch
  // onSwitch: the function to execute when the switch is clicked
  #createElement = (id, onSwitch) => {
    let element = document.createElement("div");
    element.classList.add("switch");
    if (this.is_on) {
      element.innerHTML = "ON";
      element.classList.add("switch-enabled");
    } else {
      element.innerHTML = "OFF";
      element.classList.add("switch-disabled");
    }
    element.id = id;
    element.addEventListener("click", () => this.#onClick(onSwitch));
    return element;
  };

  // #onClick is called when the switch is clicked
  //
  // onSwitch: the function to execute when the switch is clicked
  #onClick = (onSwitch) => {
    this.is_on = !this.is_on;
    this.element.classList.toggle("switch-enabled");
    this.element.classList.toggle("switch-disabled");
    if (this.is_on) {
      this.element.innerHTML = "ON";
    } else {
      this.element.innerHTML = "OFF";
    }
    onSwitch(this.is_on);
  };
}
