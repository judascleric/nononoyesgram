import { defaultFontFamily } from "../src/const";
import { CompletedPuzzles, LoadData, PuzzleEntry, PuzzleManifest } from "../src/types";

class PuzzleSelectSquare extends Phaser.GameObjects.Sprite {
    public inHighlight: boolean;
    public id: number;
    public inputDisabled: boolean;
    public puzzleData: PuzzleEntry;

    public puzzleImage: Phaser.GameObjects.Image;
    private title: Phaser.GameObjects.Text;
    private date: Phaser.GameObjects.Text;
    private x1: number;
    private y1: number;
    private x2: number;
    private y2: number;
    private scaleFactor = 1.125;
    private scale1x = 1.0;
    private scale1y = 1.0;
    private scale2x = this.scaleFactor;
    private scale2y = this.scaleFactor;
    private growTween1: Phaser.Tweens.Tween;
    private growTween2: Phaser.Tweens.Tween;
    private shrinkTween1: Phaser.Tweens.Tween;
    private shrinkTween2: Phaser.Tweens.Tween;

    constructor(
        scene: PuzzleSelectScene,
        puzzleData: PuzzleEntry,
        id: number,
        x: number,
        y: number,
        isSolved: boolean,
    ) {
        super(scene, x, y, "puzzle_frame");
        this.puzzleData = puzzleData;
        this.id = id;
        this.x1 = x;
        this.y1 = y;
        this.x2 = x;
        this.y2 = y;
        this.inputDisabled = false;
        this.inHighlight = false;
        this.growTween1 = null;
        this.growTween2 = null;
        this.shrinkTween1 = null;
        this.shrinkTween2 = null;
        this.setOrigin(0.0);
        this.setInteractive();
        this.on("pointerover", () => this.onPointerOver());
        this.on("pointerout", () => this.onPointerOut());
        this.on("pointerdown", () => ((this.scene as PuzzleSelectScene).selectedSquare = this));
        this.puzzleImage = this.scene.add.image(x, y, "unsolved").setOrigin(0.0);
        const title = isSolved ? this.puzzleData.name : this.puzzleData.id;
        this.title = this.scene.add
            .text(x - 32, y - 24, title, {
                fontFamily: defaultFontFamily,
                fontSize: "18px",
                align: "center",
            })
            .setOrigin(0, 0)
            .setFixedSize(192, 0);
        const date = isSolved ? this.puzzleData.date : "";
        this.date = this.scene.add
            .text(x - 32, y - 40, date, {
                fontFamily: defaultFontFamily,
                fontSize: "12px",
                align: "center",
            })
            .setOrigin(0, 0)
            .setFixedSize(192, 0);
    }

    onPointerOver() {
        if (!this.inputDisabled && !this.inHighlight) {
            if (this.shrinkTween1 && this.shrinkTween1.isPlaying()) {
                this.shrinkTween2.stop();
                this.shrinkTween2.stop();
                this.shrinkTween1 = null;
                this.shrinkTween2 = null;
            }
            this.growTween1 = this.scene.add.tween({
                scale: 1.125,
                x: this.x1 - 8,
                y: this.y1 - 8,
                targets: [this],
                duration: 100,
            });
            this.growTween2 = this.scene.add.tween({
                scaleX: this.scale2x,
                scaleY: this.scale2y,
                x: this.x1 - 8 / this.scale2x,
                y: this.y1 - 8 / this.scale2y,
                targets: [this.puzzleImage],
                duration: 100,
            });
            this.inHighlight = true;
        }
    }

    onPointerOut() {
        if (!this.inputDisabled && this.inHighlight) {
            if (this.growTween1 && this.growTween1.isPlaying()) {
                this.growTween1.stop();
                this.growTween2.stop();
                this.growTween1 = null;
                this.growTween2 = null;
            }
            this.shrinkTween1 = this.scene.add.tween({
                scale: 1.0,
                x: this.x1,
                y: this.y1,
                targets: [this],
                duration: 100,
            });
            this.shrinkTween2 = this.scene.add.tween({
                scaleX: this.scale1x,
                scaleY: this.scale1y,
                x: this.x2,
                y: this.y2,
                targets: [this.puzzleImage],
                duration: 100,
            });
            this.inHighlight = false;
        }
    }

    updatePuzzleImage(textureName: string, width: number, height: number) {
        this.x2 = this.puzzleImage.x + 10;
        this.y2 = this.puzzleImage.y + 10;
        this.puzzleImage.setTexture(textureName).setDisplaySize(width, height).setPosition(this.x2, this.y2);
        this.scale1x = this.puzzleImage.scaleX;
        this.scale1y = this.puzzleImage.scaleY;
        this.scale2x = this.puzzleImage.scaleX * 1.125;
        this.scale2y = this.puzzleImage.scaleY * 1.125;
    }
}

export class PuzzleSelectScene extends Phaser.Scene {
    private background: Phaser.GameObjects.Image;
    private bgm: Phaser.Sound.BaseSound;
    private puzzleSquares: PuzzleSelectSquare[];
    private completedPuzzles: CompletedPuzzles;
    private puzzleManifest: PuzzleManifest;
    public selectedSquare: PuzzleSelectSquare;
    private loadData: LoadData[];

    constructor() {
        super({
            key: "PuzzleSelectScene",
        });
    }

    preload(): void {
        this.loadData = [];
        // localStorage.setItem("completedPuzzles", "{}");
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
            if (isSolved) {
                console.log(`isSolved ${longName}`);
                this.load.image(puzzleData.image, puzzleData.image);
                this.loadData.push({ id: id, textureName: puzzleData.image });
            }
            const puzzleSquare = new PuzzleSelectSquare(
                this,
                puzzleData,
                y * 4 + x,
                left + x * xspacing,
                top + y * yspacing,
                isSolved,
            );
            this.puzzleSquares.push(puzzleSquare);
            this.add.existing(puzzleSquare);
        }
        console.log(`loadData ${this.loadData.length}`);
        if (this.loadData.length > 0) {
            this.load.start();
            this.load.once(Phaser.Loader.Events.COMPLETE, () => {
                for (const loadData of this.loadData) {
                    console.log(`${loadData.id} ${loadData.textureName}`);
                    this.puzzleSquares[loadData.id].updatePuzzleImage(loadData.textureName, 108, 108);
                }
            });
        }
    }

    update(): void {
        if (this.selectedSquare !== null) {
            localStorage.setItem("selected_puzzle", this.selectedSquare.puzzleData.path);
            this.scene.start("GameScene");
        }
    }
}
