export class MainScene extends Phaser.Scene {
    private background: Phaser.GameObjects.Image;
    private puzzleBG: Phaser.GameObjects.Rectangle;
    private puzzleGrid: Phaser.GameObjects.Line[];

    constructor() {
        super({
            key: "MainScene",
        });
    }

    preload(): void {
        this.load.image("bg_forest", "../assets/bg_forest_900_600.png");
    }

    create(): void {
        this.cameras.main.setBounds(0, 0, 900, 600);
        this.background = this.add.image(0, 0, "bg_forest").setOrigin(0, 0);
        this.puzzleBG = this.add.rectangle(300, 160, 400, 400, 0x101010, 0.8).setOrigin(0, 0);
        const minorColor = 0xaaaaaa;
        const majorColor = 0xdddddd;
        const borderColor = 0xffffff;
        const majorWidth = 2;
        const borderWidth = 2;
        this.puzzleGrid = [
            // Minor Divisions
            this.add.line(0, 0, 300, 200, 700, 200, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 300, 240, 700, 240, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 300, 280, 700, 280, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 300, 320, 700, 320, minorColor).setOrigin(0, 0),

            this.add.line(0, 0, 300, 400, 700, 400, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 300, 440, 700, 440, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 300, 480, 700, 480, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 300, 520, 700, 520, minorColor).setOrigin(0, 0),

            this.add.line(0, 0, 340, 160, 340, 560, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 380, 160, 380, 560, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 420, 160, 420, 560, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 460, 160, 460, 560, minorColor).setOrigin(0, 0),

            this.add.line(0, 0, 540, 160, 540, 560, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 580, 160, 580, 560, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 620, 160, 620, 560, minorColor).setOrigin(0, 0),
            this.add.line(0, 0, 660, 160, 660, 560, minorColor).setOrigin(0, 0),

            // Major Divisions
            this.add
                .line(0, 0, 300, 360, 700, 360)
                .setOrigin(0, 0)
                .setStrokeStyle(1, majorColor)
                .setLineWidth(majorWidth),
            this.add
                .line(0, 0, 500, 160, 500, 560)
                .setOrigin(0, 0)
                .setStrokeStyle(1, majorColor)
                .setLineWidth(majorWidth),

            // Border
            this.add
                .line(0, 0, 300, 160, 700, 160)
                .setOrigin(0, 0)
                .setStrokeStyle(1, borderColor)
                .setLineWidth(borderWidth),
            this.add
                .line(0, 0, 300, 160, 300, 560)
                .setOrigin(0, 0)
                .setStrokeStyle(1, borderColor)
                .setLineWidth(borderWidth),
            this.add
                .line(0, 0, 300, 560, 700, 560)
                .setOrigin(0, 0)
                .setStrokeStyle(1, borderColor)
                .setLineWidth(borderWidth),
            this.add
                .line(0, 0, 700, 160, 700, 560)
                .setOrigin(0, 0)
                .setStrokeStyle(1, borderColor)
                .setLineWidth(borderWidth),
        ];
    }
}
