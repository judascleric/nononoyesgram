// This tool creates a manifest of all puzzles for driving the puzzle select screen.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

const puzzleDir = "./puzzles";
const manifestFilename = "all_puzzles.json";

const index = [];
const puzzleMap = {};
const files = fs.readdirSync(puzzleDir);
files
    .filter(f => f.endsWith(".json") && f !== manifestFilename)
    .forEach(file => {
        const puzzle = JSON.parse(fs.readFileSync(puzzleDir + "/" + file));
        const longName = `${puzzle.id}-${puzzle.name}`;
        index.push(longName);
        puzzleMap[longName] = {
            name: puzzle.name,
            path: "../puzzles/" + file,
            id: puzzle.id,
            date: puzzle.date,
            image: puzzle.finishedImage,
            size: puzzle.size,
        };
    });
const manifestText = JSON.stringify({ index: index, puzzles: puzzleMap }, null, 2);
fs.writeFileSync(puzzleDir + "/" + manifestFilename, manifestText);
