// dom elements
const openSramBtn = document.getElementById("open-sram-btn");
openSramBtn.addEventListener("change", openSramFile);
const fileDataDiv = document.getElementById("file-data");
const fileOffsetsDiv = document.getElementById("file-offsets");
const fileContentsDiv = document.getElementById("file-contents");
const fileBytesHeaderDiv = document.getElementById("file-bytes-header");
const fileBytesDiv = document.getElementById("file-bytes");
const fileTextDiv = document.getElementById("file-text");
const fileCharsHeaderDiv = document.getElementById("file-chars-header");
const fileCharsDiv = document.getElementById("file-chars");

// 
const BYTES_PER_ROW = 16;


const fileReader = new FileReader();
var sramFile = [];
var sramFileOriginal = [];

function openSramFile(e) {
    var file = e.target.files[0];
    if (!file) return;

    fileReader.addEventListener("load", readFile);
    fileReader.readAsArrayBuffer(file);
}

function readFile(e) {
    // is load event only good enough?
    console.log(e);
    sramFile = new Uint8Array(fileReader.result)
    sramFileOriginal = new Uint8Array(fileReader.result); // copy of values
    console.log(sramFile);


    buildOffsets();
    fillBytesTable();
    fillTextTable();
}

function buildTableHeader() {
    for (let i = 0; i < BYTES_PER_ROW; ++i) {
        // bytes
        let val = i.toString(16).padStart(2, "0");
        let id = "bytes-header-" + i;
        let span = createTextElement("span", id, ["bytes-header"], val);
        fileBytesHeaderDiv.appendChild(span);

        // chars
        id = "chars-header-" + i;
        span = createTextElement("span", id, ["chars-header"], "-");
        fileCharsHeaderDiv.appendChild(span);
    } 
}

function buildOffsets() {
    fileOffsetsDiv.innerHTML = "";

    let len = sramFile.byteLength;
    let rows = Math.ceil(len / BYTES_PER_ROW);
    let offsetNumChars = len.toString(16).length;
    
    console.log(rows);

    let cornerDiv = createTextElement("div", "offset-corner", ["offset"], "-");
    fileOffsetsDiv.appendChild(cornerDiv);

    for (let r = 0; r < rows; ++r)
    {
        let offset = (r * BYTES_PER_ROW).toString(16).padStart(offsetNumChars, "0");
        let id = "offset-" + r;
        let offsetDiv = createTextElement("div", id, ["offset"], offset);

        fileOffsetsDiv.appendChild(offsetDiv);
    }
}

function fillBytesTable() {
    fileBytesDiv.innerHTML = "";

    let len = sramFile.byteLength;
    let rows = Math.ceil(len / BYTES_PER_ROW);

    for (let r = 0; r < rows; ++r) {
        let rowOffset = r * BYTES_PER_ROW;
        let rowDiv = document.createElement("div");
        rowDiv.classList = ["row"];

        for (let c = 0; c < BYTES_PER_ROW; ++c) {
            let pos = rowOffset + c;
            if (pos >= len) break; // in the event the last row isn't full

            // bytes
            let val = sramFile[pos].toString(16).padStart(2, "0");
            let id = "byte-" + pos;

            // highlight save slot
            const slotLength = 143;
            let classList = ["byte"];
            if (pos < slotLength) {
                classList.push("file-a");
            } else if (pos >= slotLength && pos < slotLength*2) {
                classList.push("file-b");
            } else if (pos >= slotLength*2 && pos < slotLength*3) {
                classList.push("file-c");
            }

            let span = createTextElement("span", id, classList, val);
            rowDiv.appendChild(span);
        }
        // append the row
        fileBytesDiv.appendChild(rowDiv);
    }
}


function fillTextTable() {
    fileCharsDiv.innerHTML = "";

    let len = sramFile.byteLength;
    let rows = Math.ceil(len / BYTES_PER_ROW);

    for (let r = 0; r < rows; ++r) {
        let rowOffset = r * BYTES_PER_ROW;
        let rowDiv = document.createElement("div");
        rowDiv.classList = ["row"];

        for (let c = 0; c < BYTES_PER_ROW; ++c) {
            let pos = rowOffset + c;
            if (pos >= len) break; // in the event the last row isn't full

            // text
            let char = stripControlChars(pos);
            let id = "text-" + pos;
            let span = createTextElement("span", id, ["text"], char);
            rowDiv.appendChild(span);
        }
        // append the row
        fileCharsDiv.appendChild(rowDiv);
    }
}



function stripControlChars (i) {
    if (i < 32 || i > 126) {
        return ".";
    }
    // need to html encode these
    let char = String.fromCharCode(sramFile[i]);
    console.log(char);
    return char;
}


function createTextElement(type, id, classList, text) {
    const el = document.createElement(type);
    el.id = id;
    for (let c of classList) {
        el.classList.add(c);
    }
    const elText = document.createTextNode(text);
    el.appendChild(elText);
    
    return el;
}

// init
buildTableHeader();
