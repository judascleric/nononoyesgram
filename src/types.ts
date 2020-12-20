export enum Value {
    UNSOLVED = 0,
    X = 1,
    FILL = 2,
}

export enum UnitType {
    ROW = 0,
    COL = 1,
}

export type Coord = {
    x: number;
    y: number;
};

export type CompletedPuzzles = Record<string, boolean>;

export type PuzzleEntry = {
    name: string;
    path: string;
    id: string;
    image: string;
    size: number[];
};

export type PuzzleManifest = {
    index: string[];
    puzzles: Record<string, PuzzleEntry>;
};

export type StringIndexed = Record<string, any>;
