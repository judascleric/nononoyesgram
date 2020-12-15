import { Puzzle, PuzzleConfig, PuzzleStyle } from "../src/objects/puzzle";

export class MainScene extends Phaser.Scene {
    private background: Phaser.GameObjects.Image;
    private bgm: Phaser.Sound.BaseSound;
    private puzzle: Puzzle;
    private outroStarted: boolean;

    constructor() {
        super({
            key: "MainScene",
        });
        this.outroStarted = false;
    }

    preload(): void {
        this.load.image("bg_forest", "../assets/bg_forest_900_600.png");
        this.load.audio("bgm_chill", ["../assets/bgm_chill.m4a"]);
        this.load.json("puzzle_data", "../puzzles/P001.json");
    }

    create(): void {
        this.cameras.main.setBounds(0, 0, 900, 600);
        this.background = this.add.image(0, 0, "bg_forest").setOrigin(0, 0);
        this.bgm = this.sound.add("bgm_chill", { loop: true });
        if (!this.sound.locked) {
            // already unlocked so play
            this.bgm.play();
        } else {
            // wait for 'unlocked' to fire and then play
            this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                this.bgm.play();
            });
        }
        const data = this.cache.json.get("puzzle_data");
        const style = new PuzzleStyle();
        this.puzzle = new Puzzle(this, new PuzzleConfig(data, style));
        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.puzzle.onPointerMove(pointer), this);
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.puzzle.onPointerDown(pointer), this);
        this.input.on("pointerup", () => this.puzzle.onPointerUp(), this);
    }

    update(): void {
        const solved = this.puzzle.update();
        if (solved && !this.outroStarted) {
            this.outroStarted = true;
        }
    }
}
