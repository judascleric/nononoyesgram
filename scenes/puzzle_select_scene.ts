import { defaultFontFamily } from "../src/const";
import { CompletedPuzzles, PuzzleEntry, PuzzleManifest } from "../src/types";

class PuzzleSelectSquare extends Phaser.GameObjects.Sprite {
    public inHighlight: boolean;
    public id: number;
    public inputDisabled: boolean;
    public puzzleData: PuzzleEntry;

    private puzzleFrame: Phaser.GameObjects.Image;
    private title: Phaser.GameObjects.Text;
    private x1: number;
    private y1: number;
    private growTween: Phaser.Tweens.Tween;
    private shrinkTween: Phaser.Tweens.Tween;

    constructor(scene: PuzzleSelectScene, puzzleData: PuzzleEntry, id: number, x: number, y: number, title: string) {
        super(scene, x, y, "puzzle_frame");
        this.puzzleData = puzzleData;
        this.id = id;
        this.x1 = x;
        this.y1 = y;
        this.inputDisabled = false;
        this.inHighlight = false;
        this.growTween = null;
        this.shrinkTween = null;
        this.setOrigin(0.0);
        this.setInteractive();
        this.on("pointerover", () => this.onPointerOver());
        this.on("pointerout", () => this.onPointerOut());
        this.on("pointerdown", () => ((this.scene as PuzzleSelectScene).selectedSquare = this));
        this.puzzleFrame = this.scene.add.image(x, y, "unsolved").setOrigin(0.0);
        this.title = this.scene.add
            .text(x - 32, y - 24, title, {
                fontFamily: defaultFontFamily,
                fontSize: "18px",
                align: "center",
            })
            .setOrigin(0, 0)
            .setFixedSize(192, 0);
    }

    onPointerOver() {
        if (!this.inputDisabled && !this.inHighlight) {
            if (this.shrinkTween && this.shrinkTween.isPlaying()) {
                this.shrinkTween.stop();
                this.shrinkTween = null;
            }
            this.growTween = this.scene.add.tween({
                scale: 1.125,
                x: this.x1 - 8,
                y: this.y1 - 8,
                targets: [this, this.puzzleFrame],
                duration: 100,
            });
            this.inHighlight = true;
        }
    }

    onPointerOut() {
        if (!this.inputDisabled && this.inHighlight) {
            if (this.growTween && this.growTween.isPlaying()) {
                this.growTween.stop();
                this.growTween = null;
            }
            this.shrinkTween = this.scene.add.tween({
                scale: 1.0,
                x: this.x1,
                y: this.y1,
                targets: [this, this.puzzleFrame],
                duration: 100,
            });
            this.inHighlight = false;
        }
    }
}

export class PuzzleSelectScene extends Phaser.Scene {
    private background: Phaser.GameObjects.Image;
    private bgm: Phaser.Sound.BaseSound;
    private puzzleSquares: PuzzleSelectSquare[];
    private completedPuzzles: CompletedPuzzles;
    private puzzleManifest: PuzzleManifest;
    public selectedSquare: PuzzleSelectSquare;

    constructor() {
        super({
            key: "PuzzleSelectScene",
        });
    }

    preload(): void {
        const completedData = localStorage.getItem("completedPuzzles") || "{}";
        this.completedPuzzles = JSON.parse(completedData);
        this.load.json("puzzle_manifest", "../puzzles/all_puzzles.json");
        this.load.image("bg_forest", "../assets/bg_forest_900_600.png");
        this.load.audio("bgm_chill", ["../assets/bgm_chill.m4a"]);
        this.load.image("missing", "../assets/missing.png");
        this.load.image("puzzle_frame", "../assets/select_frame.png");
        this.load.image("unsolved", "../assets/unsolved.png");
    }

    create(): void {
        this.puzzleManifest = this.cache.json.get("puzzle_manifest") as PuzzleManifest;
        this.puzzleSquares = [];
        this.selectedSquare = null;
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

        this.add
            .text(120, 80, "Puzzle Select", { fontFamily: defaultFontFamily, fontSize: "42px", align: "center" })
            .setOrigin(0, 0)
            .setFixedSize(900 - 240, 0);

        const maxPuzzles = 8;
        const pageOffset = 0;
        const puzzles = this.puzzleManifest.index.slice(pageOffset, pageOffset + maxPuzzles);
        const left = 80;
        const top = 180;
        const xspacing = 200;
        const yspacing = 180;
        for (let id = 0; id < puzzles.length; ++id) {
            const y = Math.floor(id / 4);
            const x = id % 4;
            const longName = puzzles[id];
            const puzzleData = this.puzzleManifest.puzzles[longName];
            const isSolved = this.completedPuzzles[longName] || false;
            const puzzleSquare = new PuzzleSelectSquare(
                this,
                puzzleData,
                y * 4 + x,
                left + x * xspacing,
                top + y * yspacing,
                isSolved ? puzzleData.name : puzzleData.id,
            );
            this.puzzleSquares.push(puzzleSquare);
            this.add.existing(puzzleSquare);
        }
    }

    update(): void {
        if (this.selectedSquare !== null) {
            localStorage.setItem("selected_puzzle", this.selectedSquare.puzzleData.path);
            this.scene.start("GameScene");
        }
    }
}
