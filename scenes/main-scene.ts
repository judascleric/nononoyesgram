export class MainScene extends Phaser.Scene {
    private background: Phaser.GameObjects.Image;
    private puzzleBG: Phaser.GameObjects.Rectangle;
    private puzzleGrid: Phaser.GameObjects.Line[];
    private puzzleText: Phaser.GameObjects.Text[];
    private bgm: Phaser.Sound.BaseSound;
    private fills: Phaser.GameObjects.Rectangle[];
    private xs: Phaser.GameObjects.Line[];

    constructor() {
        super({
            key: "MainScene",
        });
    }

    preload(): void {
        this.load.image("bg_forest", "../assets/bg_forest_900_600.png");
        this.load.audio("bgm_chill", ["../assets/bgm_chill.mp3"]);
    }

    create(): void {
        this.cameras.main.setBounds(0, 0, 900, 600);
        this.background = this.add.image(0, 0, "bg_forest").setOrigin(0, 0);
        const rowLen = 10;
        const colLen = 10;
        const minorColor = 0xaaaaaa;
        const majorColor = 0xdddddd;
        const borderColor = 0xffffff;
        const fillColor = 0xf3e1f7;
        const xColor = 0xdddddd;
        const majorWidth = 2;
        const borderWidth = 2;
        const unitSpace = 40;
        const width = 400;
        const height = 400;
        const left = 300;
        const top = 180;
        const right = left + width;
        const bottom = top + height;
        this.puzzleBG = this.add.rectangle(left, top, width, height, 0x101010, 0.8).setOrigin(0, 0);
        this.puzzleGrid = [];
        for (let i = 0; i < rowLen + 1; ++i) {
            let line = this.add
                .line(0, 0, left, top + i * unitSpace, right, top + i * unitSpace, minorColor)
                .setOrigin(0, 0);
            if (i % rowLen == 0) {
                line = line.setStrokeStyle(1, borderColor).setLineWidth(borderWidth);
            } else if (i % 5 == 0) {
                line = line.setStrokeStyle(1, majorColor).setLineWidth(majorWidth);
            }
            this.puzzleGrid.push(line);
        }

        for (let i = 0; i < colLen + 1; ++i) {
            let line = this.add
                .line(0, 0, left + i * unitSpace, top, left + i * unitSpace, bottom, minorColor)
                .setOrigin(0, 0);
            if (i % colLen == 0) {
                line = line.setStrokeStyle(1, borderColor).setLineWidth(borderWidth);
            } else if (i % 5 == 0) {
                line = line.setStrokeStyle(1, majorColor).setLineWidth(majorWidth);
            }
            this.puzzleGrid.push(line);
        }
        const puzzleTextStyle = { fontFamily: '"Courier New",monospace', fontSize: 28, align: "right" };
        const rowsHints = [
            [3, 3],
            [2, 4, 2],
            [1, 1],
            [1, 2, 2, 1],
            [1, 1, 1],
            [2, 2, 2],
            [1, 1],
            [1, 2, 1],
            [2, 2],
            [6],
        ];
        const colsHints = [
            [5],
            [2, 4],
            [1, 1, 2],
            [2, 1, 1],
            [1, 2, 1, 1],
            [1, 1, 1, 1, 1],
            [2, 1, 1],
            [1, 2],
            [2, 4],
            [5],
        ];
        const rowsTexts = rowsHints.map(rowHints => rowHints.join(" "));
        const colsTexts = colsHints.map(colHints => colHints.join("\n"));
        const maxRowLen = Math.max(...rowsTexts.map(rowText => rowText.length));
        const fontWidth = 18;
        const fontHeight = 13;
        const rowTextXOff = 0;
        const rowTextYOff = 8;
        const colTextXOff = 12;
        const colTextYOff = -18;
        this.puzzleText = [];
        for (let i = 0; i < rowsTexts.length; ++i) {
            this.puzzleText.push(
                this.add
                    .text(
                        left + rowTextXOff - maxRowLen * fontWidth,
                        top + rowTextYOff + i * unitSpace,
                        rowsTexts[i].padStart(maxRowLen, " "),
                        puzzleTextStyle,
                    )
                    .setOrigin(0, 0),
            );
        }
        for (let i = 0; i < colsTexts.length; ++i) {
            this.puzzleText.push(
                this.add
                    .text(
                        left + colTextXOff + i * unitSpace,
                        top + colTextYOff - colsTexts[i].length * fontHeight,
                        colsTexts[i],
                        puzzleTextStyle,
                    )
                    .setOrigin(0, 0),
            );
        }
        this.fills = [];
        this.fills.push(
            this.add.rectangle(left + 4, top + 4, unitSpace - 8, unitSpace - 8, fillColor, 0.9).setOrigin(0, 0),
        );
        this.xs = [];
        const xPad = 6;
        this.xs.push(
            this.add
                .line(0, 0, left + unitSpace + xPad, top + xPad, left + 2 * unitSpace - xPad, top + unitSpace - xPad)
                .setOrigin(0, 0)
                .setStrokeStyle(1, xColor)
                .setLineWidth(3),
        );
        this.xs.push(
            this.add
                .line(0, 0, left + unitSpace + xPad, top + unitSpace - xPad, left + 2 * unitSpace - xPad, top + xPad)
                .setOrigin(0, 0)
                .setStrokeStyle(1, xColor)
                .setLineWidth(3),
        );
        // this.bgm = this.sound.add("bgm_chill", { loop: true });
        // if (!this.sound.locked) {
        //     // already unlocked so play
        //     this.bgm.play();
        // } else {
        //     // wait for 'unlocked' to fire and then play
        //     this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        //         this.bgm.play();
        //     });
        // }
    }
}
