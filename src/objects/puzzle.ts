import { UnitType } from "../types";

export type UnitHints = number[];

export type PuzzleData = {
    name: string;
    id: string;
    size: number[];
    hints: UnitHints[][];
    solution: string[][];
};

export class PuzzleStyle {
    public bgColor: number;
    public bgAlpha: number;
    public minorColor: number;
    public majorColor: number;
    public borderColor: number;
    public fillColor: number;
    public xColor: number;
    public majorWidth: number;
    public borderWidth: number;
    public textStyle: Phaser.Types.GameObjects.Text.TextStyle;
    constructor() {
        this.bgColor = 0x101010;
        this.bgAlpha = 0.8;
        this.minorColor = 0xaaaaaa;
        this.majorColor = 0xdddddd;
        this.borderColor = 0xffffff;
        this.fillColor = 0xf3e1f7;
        this.xColor = 0xdddddd;
        this.majorWidth = 2;
        this.borderWidth = 2;
        this.textStyle = { fontFamily: '"Courier New",monospace', fontSize: "28px", align: "right" };
    }
}

export class PuzzleDim {
    public unitSpace: number;
    public width: number;
    public height: number;
    public left: number;
    public top: number;
    public right: number;
    public bottom: number;
    public fontWidth: number;
    public fontHeight: number;
    public rowTextXOff: number;
    public rowTextYOff: number;
    public colTextXOff: number;
    public colTextYOff: number;
    constructor(data: PuzzleData) {
        if (data.size[UnitType.ROW] === 10 && data.size[UnitType.COL] === 10) {
            this.unitSpace = 40;
            this.width = 400;
            this.height = 400;
            this.left = 300;
            this.top = 180;
            this.right = this.left + this.width;
            this.bottom = this.top + this.height;
            this.fontWidth = 18;
            this.fontHeight = 13;
            this.rowTextXOff = 0;
            this.rowTextYOff = 8;
            this.colTextXOff = 12;
            this.colTextYOff = -18;
        } else {
            throw new Error(`No Dimensions defined for puzzle size ${data.size}`);
        }
    }
}

export class PuzzleConfig {
    public data: PuzzleData;
    public style: PuzzleStyle;
    public dim: PuzzleDim;
    constructor(data: PuzzleData, style: PuzzleStyle) {
        this.data = data;
        this.style = style;
        this.dim = new PuzzleDim(this.data);
    }
}

export class Puzzle extends Phaser.GameObjects.Container {
    private config: PuzzleConfig;
    private puzzleBG: Phaser.GameObjects.Rectangle;
    private puzzleGrid: Phaser.GameObjects.Line[];
    private puzzleText: Phaser.GameObjects.Text[];
    private fills: Phaser.GameObjects.Rectangle[];
    private xs: Phaser.GameObjects.Line[];

    constructor(scene: Phaser.Scene, config: PuzzleConfig) {
        super(scene);
        this.config = config;
        this.puzzleGrid = [];
        this.fills = [];
        this.xs = [];
        const rowLen = this.config.data.hints[UnitType.ROW].length;
        const colLen = this.config.data.hints[UnitType.COL].length;
        const dim = this.config.dim;
        const style = this.config.style;
        this.puzzleBG = new Phaser.GameObjects.Rectangle(
            this.scene,
            dim.left,
            dim.top,
            dim.width,
            dim.height,
            style.bgColor,
            style.bgAlpha,
        ).setOrigin(0, 0);
        this.add(this.puzzleBG);
        for (let i = 0; i < rowLen + 1; ++i) {
            const yOff = dim.top + i * dim.unitSpace;
            let line = new Phaser.GameObjects.Line(
                this.scene,
                0,
                0,
                dim.left,
                yOff,
                dim.right,
                yOff,
                style.minorColor,
            ).setOrigin(0, 0);
            if (i % rowLen == 0) {
                line = line.setStrokeStyle(1, style.borderColor).setLineWidth(style.borderWidth);
            } else if (i % 5 == 0) {
                line = line.setStrokeStyle(1, style.majorColor).setLineWidth(style.majorWidth);
            }
            this.puzzleGrid.push(line);
            this.add(line);
        }
        for (let i = 0; i < colLen + 1; ++i) {
            const xOff = dim.left + i * dim.unitSpace;
            let line = new Phaser.GameObjects.Line(
                this.scene,
                0,
                0,
                xOff,
                dim.top,
                xOff,
                dim.bottom,
                style.minorColor,
            ).setOrigin(0, 0);
            if (i % colLen == 0) {
                line = line.setStrokeStyle(1, style.borderColor).setLineWidth(style.borderWidth);
            } else if (i % 5 == 0) {
                line = line.setStrokeStyle(1, style.majorColor).setLineWidth(style.majorWidth);
            }
            this.puzzleGrid.push(line);
            this.add(line);
        }
        const rowsTexts = this.config.data.hints[UnitType.ROW].map(rowHints => rowHints.join(" "));
        const colsTexts = this.config.data.hints[UnitType.COL].map(colHints => colHints.join("\n"));
        const maxRowLen = Math.max(...rowsTexts.map(rowText => rowText.length));
        this.puzzleText = [];
        for (let i = 0; i < rowsTexts.length; ++i) {
            const text = new Phaser.GameObjects.Text(
                this.scene,
                dim.left + dim.rowTextXOff - maxRowLen * dim.fontWidth,
                dim.top + dim.rowTextYOff + i * dim.unitSpace,
                rowsTexts[i].padStart(maxRowLen, " "),
                style.textStyle,
            ).setOrigin(0, 0);
            this.puzzleText.push(text);
            this.add(text);
        }
        for (let i = 0; i < colsTexts.length; ++i) {
            const text = new Phaser.GameObjects.Text(
                this.scene,
                dim.left + dim.colTextXOff + i * dim.unitSpace,
                dim.top + dim.colTextYOff - colsTexts[i].length * dim.fontHeight,
                colsTexts[i],
                style.textStyle,
            ).setOrigin(0, 0);
            this.puzzleText.push(text);
            this.add(text);
        }
        const fill = new Phaser.GameObjects.Rectangle(
            this.scene,
            dim.left + 4,
            dim.top + 4,
            dim.unitSpace - 8,
            dim.unitSpace - 8,
            style.fillColor,
            0.9,
        ).setOrigin(0, 0);
        this.fills.push(fill);
        this.add(fill);
        const xPad = 6;
        const x1 = new Phaser.GameObjects.Line(
            this.scene,
            0,
            0,
            dim.left + dim.unitSpace + xPad,
            dim.top + xPad,
            dim.left + 2 * dim.unitSpace - xPad,
            dim.top + dim.unitSpace - xPad,
        )
            .setOrigin(0, 0)
            .setStrokeStyle(1, style.xColor)
            .setLineWidth(3);
        this.xs.push(x1);
        this.add(x1);
        const x2 = new Phaser.GameObjects.Line(
            this.scene,
            0,
            0,
            dim.left + dim.unitSpace + xPad,
            dim.top + dim.unitSpace - xPad,
            dim.left + 2 * dim.unitSpace - xPad,
            dim.top + xPad,
        )
            .setOrigin(0, 0)
            .setStrokeStyle(1, style.xColor)
            .setLineWidth(3);
        this.xs.push(x2);
        this.add(x2);
        this.scene.add.existing(this);
    }
}
