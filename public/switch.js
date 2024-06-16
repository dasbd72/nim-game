class ChoiceSwitch {
  // constructor initializes the choice switch
  //
  // id: the id of the choice switch
  // onSwitch: the function to execute when the choice switch is clicked
  // choices: the choices
  // choice_index: the index of the current choice (default 0)
  // switch_class: the class for the switch (default null)
  // choice_classes: the classes for the choices (default null)
  constructor(
    id,
    onSwitch,
    choices,
    choice_index = 0,
    switch_class = null,
    choice_classes = null
  ) {
    console.log("Creating choice switch", id);
    this.choices = choices;
    this.choice_index = choice_index;
    this.switch_class = switch_class;
    this.choice_classes = choice_classes;
    this.element = this.#createElement(id, onSwitch);
  }

  // #createElement creates a choice switch with the specified id
  //
  // id: the id of the choice switch
  // onSwitch: the function to execute when the choice switch is clicked
  #createElement = (id, onSwitch) => {
    let element = document.createElement("div");
    element.id = id;
    element.classList.add("switch");
    if (this.switch_class) {
      element.classList.add(this.switch_class);
    }
    if (this.choice_classes) {
      element.classList.add(this.choice_classes[this.choice_index]);
    }
    element.innerHTML = this.choices[this.choice_index];
    element.addEventListener("click", () => this.#onClick(onSwitch));
    return element;
  };

  // #onClick is called when the choice switch is clicked
  //
  // onSwitch: the function to execute when the choice switch is clicked
  #onClick = (onSwitch) => {
    this.choice_index = (this.choice_index + 1) % this.choices.length;
    if (this.choice_classes) {
      for (let choice_class of this.choice_classes) {
        this.element.classList.remove(choice_class);
      }
      this.element.classList.add(this.choice_classes[this.choice_index]);
    }
    this.element.innerHTML = this.choices[this.choice_index];
    onSwitch(this.choice_index);
  };
}
