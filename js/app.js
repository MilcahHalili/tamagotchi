/** 
Specifications:
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
    this.boredom = 0;
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
const petNameElems = document.querySelectorAll('.pet-name')
const age = document.getElementById('age')
const hunger = document.getElementById('hunger')
const sleepiness = document.getElementById('sleepiness')
const boredom = document.getElementById('boredom')

/* event listeners */

/* functions */
function startGame() {
  for (let i = 0; i < petNameElems.length; i++) {
    petNameElems[i].textContent = tamagotchi.name
  }
  age.textContent = tamagotchi.age
  hunger.textContent = tamagotchi.hunger
  sleepiness.textContent = tamagotchi.sleepiness
  boredom.textContent = tamagotchi.boredom
}

startGame()
