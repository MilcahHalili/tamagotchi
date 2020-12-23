/** 
Specifications:
Create a Class (JS Class, look at your notes if your forget) for your tomagotchi
Instatiate your Tomagotchi
Display a character of your choice on the screen to represent your pet
Display the following metrics for your pet:
Hunger (1-10 scale)
Sleepiness (1-10 scale)
Boredom (1-10 scale)
Age
Add buttons to the screen to feed your pet, turn off the lights, and play with your pet.
Add the ability to name your pet.
Style the page.
Increase your pet's age every x minutes
Increase your pet's Hunger, Sleepiness, and Bored metrics on an interval of your choosing.
You pet should die if Hunger, Boredom, or Sleepiness hits 10.
Animate your pet across the screen while it's alive.

Extras:
Morph your pet at certain ages.
Have your tomagotchi give birth to baby tomagotchi...
...with special powers (extend the class)!
Add an excercise() method to your tomagotchi, that affects certain properties
Add anything you can think of... use your imagination!
 */

/* classes */

// super
class Pet {
  constructor(name) {
    this.name = name;
    this.hunger = 0;
    this.sleepiness = 0;
    this.boredome = 0;
    this.age = 0;
  }
}
// children

/* constants, instances, and variables */

// const
const petName = prompt('Name your Tamagotchi', '')
// instances
const tamagotchi = new Pet(petName);
// variables

/** cached DOM elements */
const playBtn = document.getElementById('play-btn')
const petNameH3 = document.getElementById('pet-name')

/* event listeners */

/* functions */
function startGame() {
  petNameH3.textContent = tamagotchi.name
}

startGame()
