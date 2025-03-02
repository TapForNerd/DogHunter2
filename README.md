# Dog Hunter 2: Side-Scrolling Edition

![Game Banner](https://placeholder-for-game-banner.png)

## Overview

Dog Hunter 2 is a side-scrolling platformer where you play as a hunting dog chasing various animals across a dynamically generated landscape. Jump across platforms, sprint to catch elusive prey, and collect power-ups while avoiding hazards. This game transforms the original top-down Dog Hunter into a Mario-style platformer with all the charm and challenge of the original.

## Features

- **Side-Scrolling Platformer**: Navigate through procedurally generated terrain with hills, platforms, and gaps
- **Animal Hunting**: Chase and catch different animals for points:
  - Rabbits that run along the ground
  - Birds that fly in patterns through the air
  - Squirrels that move along platforms and can climb
  - Pigs that are slower but worth more points (with a chance to cause sickness)
- **Collectibles and Power-ups**:
  - Bones dropped by animals (30% chance)
  - Treats that provide temporary speed boost (10% chance)
- **Status Effects**:
  - Power-up from treats (increased speed for 5 seconds)
  - Sickness from pigs (reduced speed for 15 seconds with orbiting poo)
- **Level Progression**: Score enough points to advance to increasingly difficult levels
- **Save System**: Save your progress and continue later

## Controls

- **Movement**: Arrow keys or A/D keys
- **Jump**: Space bar, W key, or Up arrow
- **Sprint**: Shift key (watch your sprint meter!)
- **Pause**: Escape key

## How to Play

1. Open `index.html` in any modern web browser
2. Click "Start Game" on the main menu
3. Use the controls to move your dog character
4. Catch animals to earn points
5. Collect bones and treats for extra points and power-ups
6. Avoid falling off platforms
7. Score enough points to advance to the next level

## Scoring

- Rabbits: 10 points
- Birds: 10 points
- Squirrels: 10 points
- Pigs: 20 points (but beware of sickness!)
- Bones: 5 points
- Treats: 10 points (plus speed boost)

## Tips

- Use sprint strategically - it has a cooldown period when depleted
- Jump to catch birds flying overhead
- Be careful when catching pigs - they have a 1/3 chance of making your dog sick
- Look for treats to cure sickness and get a speed boost
- Use platforms to reach higher areas with squirrels and birds

## Technical Details

- Built with HTML5, CSS3, and vanilla JavaScript
- No external libraries or dependencies
- Runs in any modern web browser
- Responsive design that adapts to different screen sizes
- Local storage save system

## File Structure

```
doghunter2/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── js/                 # JavaScript files
│   ├── game.js         # Main game loop and initialization
│   ├── physics.js      # Physics system (collision, gravity, etc.)
│   ├── player.js       # Player character controls and states
│   ├── entities.js     # Animals, collectibles, and obstacles
│   ├── levels.js       # Level generation and progression
│   └── ui.js           # User interface elements
├── *.png               # Game sprites (dog, animals, collectibles)
├── README.md           # This file
└── DESCRIPTION.md      # Game description
```

## Browser Compatibility

Dog Hunter 2 works best in the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Credits

- Game concept and development: Dog Hunter Team
- Sprites and assets: Original Dog Hunter assets
- Special thanks to all the virtual animals who participated in the making of this game (no actual animals were harmed)

## License

This game is provided for personal use and entertainment.

---

Enjoy playing Dog Hunter 2: Side-Scrolling Edition! Happy hunting!
