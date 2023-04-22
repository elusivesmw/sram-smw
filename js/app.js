// dom elements
const openSramBtn = document.getElementById("open-sram-btn");
openSramBtn.addEventListener("change", openSramFile);
const fileDataDiv = document.getElementById("file-data");
const fileOffsetsDiv = document.getElementById("file-offsets");
const fileContentsDiv = document.getElementById("file-contents");
const fileHeaderDiv = document.getElementById("file-header");
const fileBytesDiv = document.getElementById("file-bytes");


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
    fillTable();
}

function buildTableHeader() {
    for (let i = 0; i < BYTES_PER_ROW; ++i) {
        let val = i.toString(16).padStart(2, "0");
        let id = "header-" + i;
        let span = createTextElement("span", id, ["header"], val);
        fileHeaderDiv.appendChild(span);
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

function fillTable() {
    fileBytesDiv.innerHTML = "";

    let len = sramFile.byteLength;
    let rows = (len / BYTES_PER_ROW) + (len % BYTES_PER_ROW == 0) ? 0 : 1;

    for (let i = 0; i < len; ++i) {
        if (i > 0 && i % BYTES_PER_ROW == 0) {
            let br = document.createElement("br");
            fileBytesDiv.appendChild(br);
        }

        let val = sramFile[i].toString(16).padStart(2, "0");
        let id = "byte-" + i;

        // highlight save slot
        const slotLength = 143;
        let classList = ["byte"];
        if (i < slotLength) {
            classList.push("file-a");
        } else if (i >= slotLength && i < slotLength*2) {
            classList.push("file-b");
        } else if (i >= slotLength*2 && i < slotLength*3) {
            classList.push("file-c");
        }

        let span = createTextElement("span", id, classList, val);
        fileBytesDiv.appendChild(span);
    }
    

    // for (let r = 0; r < rows; ++r) {
    //     // create row elements
    //     let row = sramFile[r];
    //     for (let c = 0; c < BYTES_PER_ROW; ++c) {
    //         // create byte elements
    //     }
    // }
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
