export class MainScene extends Phaser.Scene {
    private phaserSprite: Phaser.GameObjects.Sprite;

    TEST = ["a", "b", "c"];

    constructor() {
        super({
            key: "MainScene",
        });
    }

    preload(): void {
        this.load.image("face", "../assets/disapproval.png");
    }

    create(): void {
        this.phaserSprite = this.add.sprite(400, 300, "face");
    }
}
