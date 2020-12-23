class Pet {
  constructor(name) {
    this.name = name;
    this.hunger = 0;
    this.sleepiness = 0;
    this.boredome = 0;
    this.age = 0;
  }
}

const petName = prompt('Name your Tamagotchi', '')

const tamagotchi = new Pet(petName);
