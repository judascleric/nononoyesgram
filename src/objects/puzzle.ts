import { Coord, PuzzleData, UnitType, Value } from "../types";
import { defaultFontFamily } from "../const";

export class PuzzleStyle {
    public bgColor: number;
    public bgAlpha: number;
    public minorColor: number;
    public majorColor: number;
    public borderColor: number;
    public fillColor: number;
    public fillAlpha: number;
    public xColor: number;
    public majorWidth: number;
    public borderWidth: number;
    public textStyle: Phaser.Types.GameObjects.Text.TextStyle;
    public titleTextStyle: Phaser.Types.GameObjects.Text.TextStyle;
    public highlightColor: number;

    constructor() {
        this.bgColor = 0x101010;
        this.bgAlpha = 0.8;
        this.minorColor = 0xaaaaaa;
        this.majorColor = 0xdddddd;
        this.borderColor = 0xffffff;
        this.fillColor = 0xf3e1f7;
        this.fillAlpha = 0.9;
        this.xColor = 0xdddddd;
        this.majorWidth = 2;
        this.borderWidth = 2;
        this.textStyle = { fontFamily: defaultFontFamily, fontSize: "28px", align: "right" };
        this.titleTextStyle = { fontFamily: defaultFontFamily, fontSize: "28px", align: "center" };
        this.highlightColor = 0x83fcb8;
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
    public fillPad: number;
    public xPad: number;
    public hPad: number;
    public titleYOff: number;
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
            this.fillPad = 4;
            this.xPad = 6;
            this.hPad = 2;
            this.titleYOff = -32;
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
    public config: PuzzleConfig;
    public puzzleBG: Phaser.GameObjects.Rectangle;
    private puzzleGrid: Phaser.GameObjects.Line[];
    private puzzleText: Phaser.GameObjects.Text[];
    private fills: Phaser.GameObjects.Rectangle[][];
    private xs: Phaser.GameObjects.Group[][];
    private xSegments: Phaser.GameObjects.Line[];
    private highlight: Phaser.GameObjects.Group;
    private highlightSegments: Phaser.GameObjects.Line[];
    private squareValues: Value[][];
    private activeBrush: Value;
    private curTouch: Coord;
    private solution: Value[][];
    private solved: boolean;
    private outroStarted: boolean;
    private titleText: Phaser.GameObjects.Text;
    private solutionImage: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, config: PuzzleConfig) {
        super(scene);
        this.config = config;
        this.solved = false;
        this.outroStarted = false;
        this.parseSolution();

        this.squareValues = new Array<Value[]>(this.config.data.size[UnitType.ROW]);
        for (let i = 0; i < this.config.data.size[UnitType.ROW]; ++i) {
            this.squareValues[i] = new Array<Value>(this.config.data.size[UnitType.COL]).fill(Value.UNSOLVED);
        }
        this.activeBrush = Value.FILL;
        this.curTouch = { x: 0, y: 0 };
        this.puzzleGrid = [];
        this.fills = [];
        this.xs = [];
        this.xSegments = [];
        this.highlightSegments = [];
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
        for (let j = 0; j < this.config.data.size[UnitType.ROW]; ++j) {
            this.fills.push([]);
            for (let i = 0; i < this.config.data.size[UnitType.COL]; ++i) {
                const fill = new Phaser.GameObjects.Rectangle(
                    this.scene,
                    dim.left + i * dim.unitSpace + dim.fillPad,
                    dim.top + j * dim.unitSpace + dim.fillPad,
                    dim.unitSpace - 2 * dim.fillPad,
                    dim.unitSpace - 2 * dim.fillPad,
                    style.fillColor,
                    style.fillAlpha,
                )
                    .setOrigin(0, 0)
                    .setVisible(false);
                this.fills[j].push(fill);
                this.add(fill);
            }
        }
        for (let j = 0; j < this.config.data.size[UnitType.ROW]; ++j) {
            this.xs.push([]);
            for (let i = 0; i < this.config.data.size[UnitType.COL]; ++i) {
                const x1 = new Phaser.GameObjects.Line(
                    this.scene,
                    dim.left + i * dim.unitSpace,
                    dim.top + j * dim.unitSpace,
                    dim.xPad,
                    dim.xPad,
                    dim.unitSpace - dim.xPad,
                    dim.unitSpace - dim.xPad,
                )
                    .setOrigin(0, 0)
                    .setStrokeStyle(1, style.xColor)
                    .setLineWidth(3);
                const x2 = new Phaser.GameObjects.Line(
                    this.scene,
                    dim.left + i * dim.unitSpace,
                    dim.top + j * dim.unitSpace,
                    dim.xPad,
                    dim.unitSpace - dim.xPad,
                    dim.unitSpace - dim.xPad,
                    dim.xPad,
                )
                    .setOrigin(0, 0)
                    .setStrokeStyle(1, style.xColor)
                    .setLineWidth(3);
                const group = new Phaser.GameObjects.Group(this.scene, [x1, x2]).setVisible(false);
                this.xSegments.push(x1);
                this.xSegments.push(x2);
                this.xs[j].push(group);
                this.add([x1, x2]);
            }
        }
        const h1 = new Phaser.GameObjects.Line(
            this.scene,
            0,
            0,
            dim.hPad,
            dim.hPad,
            dim.unitSpace - dim.hPad,
            dim.hPad,
            style.highlightColor,
        ).setOrigin(0, 0);
        const h2 = new Phaser.GameObjects.Line(
            this.scene,
            0,
            0,
            dim.hPad,
            dim.unitSpace - dim.hPad,
            dim.unitSpace - dim.hPad,
            dim.unitSpace - dim.hPad,
            style.highlightColor,
        ).setOrigin(0, 0);
        const h3 = new Phaser.GameObjects.Line(
            this.scene,
            0,
            0,
            dim.hPad,
            dim.hPad,
            dim.hPad,
            dim.unitSpace - dim.hPad,
            style.highlightColor,
        ).setOrigin(0, 0);
        const h4 = new Phaser.GameObjects.Line(
            this.scene,
            0,
            0,
            dim.unitSpace - dim.hPad,
            dim.hPad,
            dim.unitSpace - dim.hPad,
            dim.unitSpace - dim.hPad,
            style.highlightColor,
        ).setOrigin(0, 0);
        this.highlight = new Phaser.GameObjects.Group(this.scene, [h1, h2, h3, h4]).setVisible(false);
        this.highlightSegments = [h1, h2, h3, h4];
        this.add(this.highlightSegments);
        this.titleText = new Phaser.GameObjects.Text(
            this.scene,
            dim.left,
            dim.top + dim.titleYOff,
            this.config.data.name,
            style.titleTextStyle,
        )
            .setOrigin(0, 0)
            .setAlpha(0.0)
            .setFixedSize(dim.width, 0);
        this.add(this.titleText);
        this.solutionImage = new Phaser.GameObjects.Image(this.scene, dim.left, dim.top, "missing")
            .setOrigin(0, 0)
            .setAlpha(0.0);
        this.add(this.solutionImage);
        this.scene.load.image("solution_image", this.config.data.image);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
            this.solutionImage
                .setTexture("solution_image")
                .setDisplaySize(this.config.dim.width, this.config.dim.height);
        });
        this.scene.load.start();
        this.scene.add.existing(this);
    }

    inSquare(x: number, y: number): Coord | null {
        const dim = this.config.dim;
        if (x < dim.left || x > dim.right || y < dim.top || y > dim.bottom) return null;
        return { x: Math.floor((x - dim.left) / dim.unitSpace), y: Math.floor((y - dim.top) / dim.unitSpace) } as Coord;
    }

    onPointerMove(pointer: Phaser.Input.Pointer): void {
        if (this.solved) return;
        const coord = this.inSquare(pointer.x, pointer.y);
        if (coord === null) {
            this.highlight.setVisible(false);
            return;
        }
        const dim = this.config.dim;
        this.highlight.setX(dim.left + coord.x * dim.unitSpace);
        this.highlight.setY(dim.top + coord.y * dim.unitSpace);
        this.highlight.setVisible(true);
        if (pointer.isDown) {
            if (coord.x !== this.curTouch.x || coord.y !== this.curTouch.y) {
                this.curTouch = coord;
                const cur = this.squareValues[coord.y][coord.x];
                if (this.activeBrush === Value.UNSOLVED || cur === Value.UNSOLVED) {
                    this.setSquare(coord, this.activeBrush);
                }
            }
        }
    }

    onPointerDown(pointer: Phaser.Input.Pointer): void {
        if (this.solved) return;
        const coord = this.inSquare(pointer.x, pointer.y);
        if (coord === null) return;
        const cur = this.squareValues[coord.y][coord.x];
        if (cur === Value.UNSOLVED) {
            this.activeBrush = Value.FILL;
        } else if (cur === Value.FILL) {
            this.activeBrush = Value.X;
        } else {
            this.activeBrush = Value.UNSOLVED;
        }
        this.curTouch = coord;
        this.setSquare(coord, this.activeBrush);
    }

    onPointerUp(): void {
        this.curTouch = { x: -1, y: -1 };
        this.activeBrush = Value.UNSOLVED;
    }

    setSquare(coord: Coord, value: Value): void {
        this.squareValues[coord.y][coord.x] = value;
        if (this.isSolved()) {
            this.solved = true;
        }
        if (value === Value.FILL) {
            this.fills[coord.y][coord.x].setVisible(true);
            this.xs[coord.y][coord.x].setVisible(false);
        } else if (value === Value.X) {
            this.fills[coord.y][coord.x].setVisible(false);
            this.xs[coord.y][coord.x].setVisible(true);
        } else {
            this.fills[coord.y][coord.x].setVisible(false);
            this.xs[coord.y][coord.x].setVisible(false);
        }
    }

    parseSolution(): void {
        this.solution = new Array<Value[]>();
        this.config.data.solution.forEach(rowText => {
            this.solution.push([...rowText.replace(/\s/g, "")].map(c => (c === "1" ? Value.FILL : Value.UNSOLVED)));
        });
        // console.log(`solution =\n${this.solution.map(row => row.toString()).join("\n")}`);
    }

    isSolved(): boolean {
        for (let y = 0; y < this.config.data.size[UnitType.ROW]; ++y) {
            for (let x = 0; x < this.config.data.size[UnitType.COL]; ++x) {
                if (this.solution[y][x] === Value.FILL && this.squareValues[y][x] !== Value.FILL) {
                    return false;
                }
                if (this.squareValues[y][x] === Value.FILL && this.solution[y][x] !== Value.FILL) {
                    return false;
                }
            }
        }
        return true;
    }

    outro(): void {
        const fadeOutObjs = [...this.puzzleGrid, ...this.puzzleText, ...this.highlightSegments, ...this.xSegments];
        const fadeTimeMs = 2000;
        this.scene.add.tween({ alpha: 0.0, targets: fadeOutObjs, duration: fadeTimeMs });
        const allFills = [].concat(...this.fills);
        this.scene.add.tween({ alpha: 0.5, targets: allFills, delay: fadeTimeMs, duration: fadeTimeMs });
        this.scene.add.tween({ alpha: 1.0, targets: this.titleText, delay: fadeTimeMs, duration: fadeTimeMs });
        this.scene.add.tween({ alpha: 0.5, targets: this.solutionImage, delay: fadeTimeMs, duration: fadeTimeMs });
    }

    update(): boolean {
        if (this.solved && !this.outroStarted) {
            this.outro();
            this.outroStarted = true;
        }
        return this.solved;
    }
}
