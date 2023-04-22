// dom elements
const openSramBtn = document.getElementById("open-sram-btn");
openSramBtn.addEventListener("change", openSramFile);
const fileContentsDiv = document.getElementById("file-contents");
const fileHeaderDiv = document.getElementById("file-header");


// 
const BYTES_PER_ROW = 16;


const fileReader = new FileReader();
var sramFile = [];

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
    console.log(sramFile);

    fillTable();
}

function buildTableHeader() {
    for (let i = 0; i < BYTES_PER_ROW; ++i) {
        let idx = i.toString(16);
        let span = createByteSpan("header", i, idx);
        fileHeaderDiv.appendChild(span);
    } 
}

function fillTable() {
    let len = sramFile.byteLength;
    let rows = (len / BYTES_PER_ROW) + (len % BYTES_PER_ROW == 0) ? 0 : 1;

    for (let i = 0; i < len; ++i) {
        let val = sramFile[i].toString(16);
        let span = createByteSpan("byte", i, val);
        fileContentsDiv.appendChild(span);

        if (i > 0 && i % BYTES_PER_ROW == 0) {
            let br = document.createElement("br");
            fileContentsDiv.appendChild(br);
        }
    }
    

    // for (let r = 0; r < rows; ++r) {
    //     // create row elements
    //     let row = sramFile[r];
    //     for (let c = 0; c < BYTES_PER_ROW; ++c) {
    //         // create byte elements
    //     }
    // }
}

function createByteSpan(prefix, index, value) {
    const span = document.createElement("span");
    span.id = prefix + "-" + index;
    const spanContent = document.createTextNode(value);
    span.appendChild(spanContent);

    return span;
}

// function padLeft(str) {
// }

// init
buildTableHeader();
