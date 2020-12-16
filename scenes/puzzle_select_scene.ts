export class PuzzleSelectScene extends Phaser.Scene {
    private background: Phaser.GameObjects.Image;
    private bgm: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: "PuzzleSelectScene",
        });
    }

    preload(): void {
        this.load.image("bg_forest", "../assets/bg_forest_900_600.png");
        this.load.audio("bgm_chill", ["../assets/bgm_chill.m4a"]);
        this.load.image("missing", "../assets/missing.png");
        this.load.image("puzzle_frame", "../assets/select_frame.png");
        this.load.image("unsolved", "../assets/unsolved.png");
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
        this.add.image(200, 200, "unsolved").setOrigin(0, 0);
        this.add.image(200, 200, "puzzle_frame").setOrigin(0, 0);
        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.onPointerMove(pointer), this);
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.onPointerDown(pointer), this);
        this.input.on("pointerup", () => this.onPointerUp(), this);
    }

    update(): void {}
    onPointerMove(pointer: Phaser.Input.Pointer): void {}
    onPointerDown(pointer: Phaser.Input.Pointer): void {}
    onPointerUp(): void {}
}
