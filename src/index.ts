import { FileData } from "./file-data";
import "../css/style.scss";

// dom elements
const openSramBtn = document.getElementById("open-sram-btn");
openSramBtn.addEventListener("change", openSramFile);
const checksumBtn = document.getElementById("checksum-btn");
checksumBtn.addEventListener("click", testChecksum);

document.addEventListener("keypress", docKeyPress);
document.addEventListener("keydown", docKeyDown, true);
const fileInfoDiv = document.getElementById("file-info");
const saveSramBtn = document.getElementById("save-sram-btn");
saveSramBtn.addEventListener("click", saveSramFile);



// hex editor
const fileDataDiv = document.getElementById("hex-editor");
const offsetsColDiv = document.getElementById("offsets-col");
const bytesColDiv = document.getElementById("bytes-col");
const bytesHeaderDiv = document.getElementById("bytes-header");
const bytesDataDiv = document.getElementById("bytes-data");
const charsColDiv = document.getElementById("chars-col");
const charsHeaderDiv = document.getElementById("chars-header");
const charsDataDiv = document.getElementById("chars-data");

// selected byte data
const selectionDiv = document.getElementById("selection");

// consts
const BYTES_PER_ROW = 16;

// config
var showHeader = false;

// global vars
const fileReader = new FileReader();
var sramFile: Uint8Array;
var sramFileOriginal: Uint8Array;
var openFileName = "";


function openSramFile(e: ProgressEvent) {
    let file = (<HTMLInputElement>e.target).files[0];
    if (!file) return;
    openFileName = file.name;

    fileReader.addEventListener("load", readFile);
    fileReader.readAsArrayBuffer(file);
}

function readFile(e: Event) {
    // is load event only good enough?
    console.log(e);
    let result = fileReader.result as ArrayBufferLike;
    sramFile = new Uint8Array(result);
    console.log(fileReader);
    sramFileOriginal = sramFile.slice(0); // copy of values
    console.log(sramFile);

    fileInfoDiv.innerHTML = "";
    const elText = document.createTextNode(sramFile.byteLength + " bytes");
    fileInfoDiv.appendChild(elText);

    buildOffsets();
    fillBytesData();
    fillTextTable();
}

function saveSramFile(e: Event) {
    console.log(e);

    if (sramFile) {
        var blob = new Blob([sramFile], {type: "application/octet-stream"});
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = openFileName;
        link.click();
    }
}

function buildHexEditorHeader() {
    buildOffsetsHeader(2);

    for (let i = 0; i < BYTES_PER_ROW; ++i) {
        // bytes
        let val = i.toString(16).padStart(2, "0");
        let span = createTextElement("span", val);
        span.id = "bytes-header-" + i;
        span.classList.add("byte");
        span.classList.add("header");
        bytesHeaderDiv.appendChild(span);
        if (!showHeader) bytesHeaderDiv.classList.add("hidden");

        // chars
        span = createTextElement("span", "-");
        span.classList.add("char");
        span.classList.add("header");
        charsHeaderDiv.appendChild(span);
        if (!showHeader) charsHeaderDiv.classList.add("hidden");
    } 
}

function buildOffsets() {
    offsetsColDiv.innerHTML = "";

    let len = sramFile.byteLength;
    let rows = Math.ceil(len / BYTES_PER_ROW);
    let maxVal = len - 1;
    let offsetNumChars = maxVal.toString(16).length;

    buildOffsetsHeader(offsetNumChars);

    // build rows
    for (let r = 0; r < rows; ++r) {
        let offset = (r * BYTES_PER_ROW).toString(16).padStart(offsetNumChars, "0");
        let offsetSpan = createTextElement("span", offset);
        offsetSpan.classList.add("offset");

        offsetsColDiv.appendChild(offsetSpan);
    }
}

function buildOffsetsHeader(width: number) {
    let offsetsHeaderSpan = createTextElement("span", "".padStart(width,"-"));
    offsetsHeaderSpan.id = "offsets-header";
    offsetsHeaderSpan.classList.add("offset");
    offsetsHeaderSpan.classList.add("header");
    if (!showHeader) offsetsHeaderSpan.classList.add("hidden");
    offsetsColDiv.appendChild(offsetsHeaderSpan);
}

function toggleHeader() {
    const offsetsHeaderSpan = document.getElementById("offsets-header");
    showHeader = !showHeader;
    if (showHeader) {
        offsetsHeaderSpan.classList.remove("hidden");
        bytesHeaderDiv.classList.remove("hidden");
        charsHeaderDiv.classList.remove("hidden");
    } else {
        offsetsHeaderSpan.classList.add("hidden");
        bytesHeaderDiv.classList.add("hidden");
        charsHeaderDiv.classList.add("hidden");
    }
}

function fillBytesData() {
    bytesDataDiv.innerHTML = "";

    let len = sramFile.byteLength;
    let rows = Math.ceil(len / BYTES_PER_ROW);

    for (let r = 0; r < rows; ++r) {
        let rowOffset = r * BYTES_PER_ROW;
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (let c = 0; c < BYTES_PER_ROW; ++c) {
            let pos:number = rowOffset + c;
            if (pos >= len) break; // in the event the last row isn't full

            // bytes
            let val = sramFile[pos].toString(16).padStart(2, "0");
            let span = createTextElement("span", val);
            span.classList.add("byte");
            span.dataset.pos = pos.toString();

            // highlight save slot
            addSlotClasses(span, pos);
            
            span.addEventListener("click", byteClick);

            rowDiv.appendChild(span);
        }
        // append the row
        bytesDataDiv.appendChild(rowDiv);
    }
}

function addSlotClasses(target: Element, pos: number) {
    const slotLength = 143;
    if (pos < slotLength) {
        target.classList.add("file-a");
    } else if (pos >= slotLength && pos < slotLength*2) {
        target.classList.add("file-b");
    } else if (pos >= slotLength*2 && pos < slotLength*3) {
        target.classList.add("file-c");
    } else if (pos >= slotLength*3 && pos < slotLength*4) {
        target.classList.add("file-a");
        target.classList.add("backup");
    } else if (pos >= slotLength*4 && pos < slotLength*5) {
        target.classList.add("file-b");
        target.classList.add("backup");
    } else if (pos >= slotLength*5 && pos < slotLength*6) {
        target.classList.add("file-c");
        target.classList.add("backup");
    } 
}

function byteClick(e:Event) {
    // remove selected
    deselectAll();

    //move selected class
    const target = <HTMLElement>e.target;
    target.classList.add("selected");
    
    // update selection data
    updateSelectionData(target);
}

function deselectAll() {
    const lastSelected = document.getElementsByClassName("selected");
    for (const ls of lastSelected as any) {
        ls.classList.remove("selected");
        
        // was byte edit interrupted?
        let bufferChar = ls.dataset.buffer;
        if (bufferChar) {
            // sram file has already been updated
            // just delete the buffer and pad with a "0"
            delete ls.dataset.buffer;
            ls.innerHTML = "0" + ls.innerHTML;
        }
    }
}

function updateSelectionData(target:HTMLElement) {
    selectionDiv.innerHTML = "";

    // get data
    let pos = parseInt(target.dataset.pos);
    let view = new FileData(pos);
    let val = target.innerHTML;
    console.log("pos: " + pos.toString(16));

    // header
    let selectionFileSpan = createTextElement("span", view.SlotName);
    selectionFileSpan.classList.add("selection-data")
    addSlotClasses(selectionFileSpan, pos);
    selectionDiv.appendChild(selectionFileSpan);

    let selectionRegionSpan = createTextElement("span", view.RegionText);
    selectionRegionSpan.classList.add("selection-data")
    selectionDiv.appendChild(selectionRegionSpan);

    // info
    let selectionValSpan = createTextElement("span", val);
    selectionValSpan.classList.add("selection-data");
    selectionDiv.appendChild(selectionValSpan);
}

function docKeyPress(e:KeyboardEvent) {
    //console.log(e);
    
    // throw out commands
    if (e.ctrlKey) return;

    // TODO: handle enter key

    // and non-hex chars
    let num = parseInt(e.key, 16);
    if (isNaN(num)) return;

    let char = num.toString(16);
    console.log("num press: " + char);

    // get current selection byte
    const selected = document.getElementsByClassName("selected");
    if (selected.length !== 1) return;
    const target = <HTMLElement>selected[0];
    //console.log(target);
    let pos = parseInt(target.dataset.pos);

    let newVal: string;
    let buffer = target.dataset.buffer;
    if (buffer) {
        delete target.dataset.buffer;
        newVal = buffer + char;

        let next = pos + 1;
        advanceSelection(next);
    } else {
        target.dataset.buffer = char;
        newVal = char;
    }
    sramFile[pos] = parseInt(newVal, 16);

    // update byte in hex editor to match array data
    target.innerHTML = newVal;

    // update char in text view
    const textTarget = document.querySelector("span.text[data-pos='" + pos + "']");
    textTarget.innerHTML = byteToChar(pos);

    // did val change?
    diff(pos);
}

function advanceSelection(pos:number) {
    if (pos < 0) return; // maybe wrap to eof later
    if (pos >= sramFile.byteLength) return; // maybe wrap to 0 later

    // remove selected
    deselectAll();
    
    // update selected span
    const nextTarget = <HTMLElement>document.querySelector("span[data-pos='" + pos + "']");
    if (nextTarget === null) return;
    nextTarget.classList.add("selected");

    // scroll into view
    nextTarget.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });

    // update selection data
    updateSelectionData(nextTarget);
}

function docKeyDown(e: KeyboardEvent) {
    console.log(e);

    // get current selection byte
    const selected = document.getElementsByClassName("selected");
    if (selected.length !== 1) return;
    const target = <HTMLElement>selected[0];
    console.log(target);

    let pos = parseInt(target.dataset.pos);
    let next;

    // handle arrow controls 
    switch (e.key) {
        case "ArrowLeft":
            e.preventDefault();
            next = pos - 1;
            advanceSelection(next);
            break;
        case "ArrowUp":
            e.preventDefault();
            next = pos - BYTES_PER_ROW;
            advanceSelection(next);
            break;
        case "ArrowDown":
            e.preventDefault();
            next = pos + BYTES_PER_ROW;
            advanceSelection(next);
            break;
        case "ArrowRight":
            e.preventDefault();
            next = pos + 1;
            advanceSelection(next);
            break;
    }
}

function fillTextTable() {
    charsDataDiv.innerHTML = "";

    let len = sramFile.byteLength;
    let rows = Math.ceil(len / BYTES_PER_ROW);

    for (let r = 0; r < rows; ++r) {
        let rowOffset = r * BYTES_PER_ROW;
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (let c = 0; c < BYTES_PER_ROW; ++c) {
            let pos = rowOffset + c;
            if (pos >= len) break; // in the event the last row isn't full

            // text
            let char = byteToChar(pos);
            let span = createTextElement("span", char);
            span.classList.add("text");
            span.dataset.pos = pos.toString();
            rowDiv.appendChild(span);
        }
        // append the row
        charsDataDiv.appendChild(rowDiv);
    }
}

function byteToChar (i:number) {
    let charcode = sramFile[i];
    // control chars to .
    if (charcode < 0x20 || (charcode > 0x7E && charcode < 0xA0)) {
        return ".";
    }
    // space and 0xFF to nbsp;
    if (charcode == 0x20 || charcode == 0xFF) return "\u00A0";
    // soft hypen to hyphen
    if (charcode == 0xAD) return "-";
    // otherwise get the char
    return String.fromCharCode(charcode);
}

function createTextElement(type:string, text:string) {
    const el = document.createElement(type);
    const elText = document.createTextNode(text);
    el.appendChild(elText);
    return el;
}

function diffAll() {
    for (let i = 0; i < sramFileOriginal.byteLength; ++i) {
        diff(i);
    } 
}

function diff(i:number) {
    let originalByte = sramFileOriginal[i];
    let byte = sramFile[i];
    let spans = document.querySelectorAll("span[data-pos='" + i + "']");

    for (const span of spans as any) {
        if (byte === originalByte) {
            span.classList.remove("changed");
        } else {
            span.classList.add("changed");
        }
    }
}


function testChecksum() {
    const DefaultTotal = 0x5A5A;
    const ChecksumPos = 0x008D;

    checksum(0, ChecksumPos, DefaultTotal);
}

function checksum(start: number, end: number, total: number) {
    const maxint16 = Math.pow(2, 16);

    if (!sramFile) return;
    if (sramFile.byteLength < end) return;

    // is there a built in wrap around?
    let sum = 0;
    for (let i = start; i < end; ++i) {
        let byteVal = sramFile[i];
        sum = (sum + byteVal) % maxint16;
    }
    console.log("total: " + total.toString(16));
    console.log("sum: " + sum.toString(16));
    let checksum = total - sum;
    console.log("checksum: " + Math.abs(checksum).toString(16)); // only abs in the display
    console.log("assert: " + (sum + checksum).toString(16) + " should be " + total.toString(16));
}

// init
buildHexEditorHeader();
