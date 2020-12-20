// This is the tool to create game data for NonoNoYesGram
// Create the puzzle in an image editor
// Settings:
//    Filename: {PuzzleID}-{Name}.png
//    Format: RGB/8-bit, Indexed, Compression = 9, Store Alpha Channel
//    Content: Black(0) for unfilled values, White/Color(non-0) for filled values
//             Before saving, convert black to alpha
// Usage:
//    pushd script && yarn install && popd
//    node scripts/create_puzzle.js ./puzzles/images/P001-Perseids.png

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const getPixels = require("get-pixels");

const args = process.argv.slice(2);
const sourceImagePath = args[0];
console.log(sourceImagePath);

const fileName = sourceImagePath.substring(sourceImagePath.lastIndexOf("/") + 1);
const outFile = `${__dirname}/../puzzles/${fileName.split(".")[0]}.json`;
const parts = fileName.replace(".png", "").split("-");
const sourceFinishedPath = sourceImagePath.replace(".png", ".finished.png");
const imagePath = `../puzzles/images/${fileName}`;
const finishedPath = imagePath.replace(".png", ".finished.png");
console.log(parts);
const puzzleData = {
    name: parts[1].replace(/_/g, " "),
    id: parts[0],
    date: parts.slice(2).join("-"),
    image: imagePath,
    finishedImage: fs.existsSync(sourceFinishedPath) ? finishedPath : imagePath,
};

getPixels(sourceImagePath, function (err, pixels) {
    if (err) {
        console.log(`${sourceImagePath} not found`);
        return;
    }
    console.log("got pixels", pixels.shape.slice());
    const solution = [];
    const values = [];
    for (let y = 0; y < pixels.shape[1]; ++y) {
        const row = [];
        for (let x = 0; x < pixels.shape[0]; ++x) {
            const val = pixels.get(x, y, 0) + pixels.get(x, y, 1) + pixels.get(x, y, 2);
            const rgba = [pixels.get(x, y, 0), pixels.get(x, y, 1), pixels.get(x, y, 2), pixels.get(x, y, 3)];
            console.log(`(${x}, ${y}) - ${val} - (${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`);
            row.push(val === 0 ? 0 : 1);
        }
        values.push(row);
        // console.log(`row = ${row}`);
        solution.push(
            row
                .map(v => (v === 1 ? "1" : "0"))
                .join("")
                .match(/.{1,5}/g)
                .join(" "),
        );
    }
    const allHints = [[], []];
    for (let y = 0; y < pixels.shape[1]; ++y) {
        let startValue = -1;
        const hints = [];
        for (let x = 0; x < pixels.shape[0]; ++x) {
            if (startValue === -1 && values[y][x] === 1) {
                startValue = x;
            } else if (startValue !== -1 && values[y][x] === 0) {
                hints.push(x - startValue);
                startValue = -1;
            }
        }
        if (startValue !== -1) {
            hints.push(pixels.shape[0] - startValue);
        }
        if (hints.length === 0) {
            hints.push(0);
        }
        allHints[0].push(hints);
    }
    for (let x = 0; x < pixels.shape[0]; ++x) {
        let startValue = -1;
        const hints = [];
        for (let y = 0; y < pixels.shape[1]; ++y) {
            if (startValue === -1 && values[y][x] === 1) {
                startValue = y;
            } else if (startValue !== -1 && values[y][x] === 0) {
                hints.push(y - startValue);
                startValue = -1;
            }
        }
        if (startValue !== -1) {
            hints.push(pixels.shape[1] - startValue);
        }
        if (hints.length === 0) {
            hints.push(0);
        }
        allHints[1].push(hints);
    }

    puzzleData["size"] = [pixels.shape[0], pixels.shape[1]];
    puzzleData["solution"] = solution;
    let puzzleDataText = JSON.stringify(puzzleData, null, 2);
    puzzleDataText = puzzleDataText.slice(0, puzzleDataText.length - 2) + ",";
    const hintsText = `  "hints": [\n    [\n      ${allHints[0]
        .map(hints => "[" + hints.map(c => c).join(", ") + "]")
        .join(",\n      ")}\n    ], [\n      ${allHints[1]
        .map(hints => "[" + hints.map(c => c).join(", ") + "]")
        .join(",\n      ")}\n    ]\n  ]\n`;
    puzzleDataText = `${puzzleDataText}\n${hintsText}}\n`;
    console.log(`puzzleData = ${puzzleDataText}`);
    fs.writeFileSync(outFile, puzzleDataText);
});
