import "phaser";
import { GameScene } from "../scenes/games_scene";
import { PuzzleSelectScene } from "../scenes/puzzle_select_scene";
import { Puzzle } from "./objects/puzzle";

// main game configuration
const config: Phaser.Types.Core.GameConfig = {
    width: 900,
    height: 600,
    type: Phaser.AUTO,
    parent: "game",
    render: {
        pixelArt: true,
    },
    scene: PuzzleSelectScene,
    // scene: GameScene,
};

export class Game extends Phaser.Game {
    private puzzle: Puzzle;
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}

// when the page is loaded, create our game instance
window.addEventListener("load", () => {
    const game = new Game(config);
    console.log(game);
});
