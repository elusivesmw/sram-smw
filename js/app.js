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

const byteInfoDiv = document.getElementById("byte-info");

// 
const BYTES_PER_ROW = 16;


const fileReader = new FileReader();
var sramFile = [];
var sramFileOriginal = [];

var lastSelected = null;

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
        let span = createTextElement("span", val);
        span.id = "bytes-header-" + i;
        span.classList.add("bytes-header");
        fileBytesHeaderDiv.appendChild(span);

        // chars
        span = createTextElement("span", "-");
        span.id = "chars-header-" + i;
        span.classList.add("chars-header");
        fileCharsHeaderDiv.appendChild(span);
    } 
}

function buildOffsets() {
    fileOffsetsDiv.innerHTML = "";

    let len = sramFile.byteLength;
    let rows = Math.ceil(len / BYTES_PER_ROW);
    let offsetNumChars = len.toString(16).length;
    
    console.log(rows);

    let cornerDiv = createTextElement("div", "".padStart(offsetNumChars,"-"));
    cornerDiv.classList.add("offset");
    cornerDiv.classList.add("offset-header");
    fileOffsetsDiv.appendChild(cornerDiv);

    for (let r = 0; r < rows; ++r)
    {
        let offset = (r * BYTES_PER_ROW).toString(16).padStart(offsetNumChars, "0");
        let offsetDiv = createTextElement("div", offset);
        offsetDiv.id = "offset-" + r;
        offsetDiv.classList.add("offset");

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
           
        

            let span = createTextElement("span", val);
            span.classList.add("byte");
            span.dataset.pos = pos;

            // highlight save slot
            const slotLength = 143;
            if (pos < slotLength) {
                span.classList.add("file-a");
            } else if (pos >= slotLength && pos < slotLength*2) {
                span.classList.add("file-b");
            } else if (pos >= slotLength*2 && pos < slotLength*3) {
                span.classList.add("file-c");
            } else if (pos >= slotLength*3 && pos < slotLength*4) {
                span.classList.add("file-a");
                span.classList.add("backup");
            } else if (pos >= slotLength*4 && pos < slotLength*5) {
                span.classList.add("file-b");
                span.classList.add("backup");
            } else if (pos >= slotLength*5 && pos < slotLength*6) {
                span.classList.add("file-c");
                span.classList.add("backup");
            } 
            
            span.addEventListener("click", byteClick);

            rowDiv.appendChild(span);
        }
        // append the row
        fileBytesDiv.appendChild(rowDiv);

       
    }
}

function byteClick(e) {
    byteInfoDiv.innerHTML = "";

    // move selected class
    if (lastSelected != null) {
        lastSelected.classList.remove("selected");
    }
    e.target.classList.add("selected");

    // get data
    let pos = e.target.dataset.pos;
    let view = new FileData(pos);
    let val = e.target.innerHTML;
    console.log(pos.toString(16));

    // header
    let selectedHeaderDiv = document.createElement("div");
    selectedHeaderDiv.classList.add("selected-header");
    let selectedHeaderSpan = createTextElement("span", view.SlotName + ": "+ view.RegionText);
    selectedHeaderSpan.classList.add("chars-header")
    selectedHeaderDiv.appendChild(selectedHeaderSpan);

    // info
    let selectedByteInfo = document.createElement("div");
    selectedByteInfo.classList.add("row");
    let selectedValSpan = createTextElement("span", val);
    selectedByteInfo.appendChild(selectedValSpan);

    byteInfoDiv.appendChild(selectedHeaderDiv);
    byteInfoDiv.appendChild(selectedByteInfo);

    // save last
    lastSelected = e.target;
}


function fillTextTable() {
    fileCharsDiv.innerHTML = "";

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
            span.dataset.pos = pos;
            rowDiv.appendChild(span);
        }
        // append the row
        fileCharsDiv.appendChild(rowDiv);
    }
}



function byteToChar (i) {
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


function createTextElement(type, text) {
    const el = document.createElement(type);
    const elText = document.createTextNode(text);
    el.appendChild(elText);
    return el;
}

// init
buildTableHeader();

class FileData {
    constructor (pos) {
        const OverworldLevelSettingFlags = 0x0000; // 96 bytes
        const OverworldEventFlags = 0x0060; // 15 bytes
        const CurrentSubmapMario = 0x006F; // 1 byte
        const CurrentSubmapLuigi = 0x0070; // 1 byte
        const PlayerAnimation = 0x0071; // 4 bytes
        const OverworldXPosMario = 0x0075; // 2 bytes
        const OverworldYPosMario = 0x0077; // 2 bytes
        const OverworldXPosLuigi = 0x0079; // 2 bytes
        const OverworldYPosLuigi = 0x007B; // 2 bytes
        const PointerOverworldXPosMario = 0x007D; // 2 bytes
        const PointerOverworldYPosMario = 0x007F; // 2 bytes
        const PointerOverworldXPosLuigi = 0x0081; // 2 bytes
        const PointerOverworldYPosLuigi = 0x0083; // 2 bytes
        const SwitchBlockFlagsGreen = 0x0085; // 1 byte
        const SwitchBlockFlagsYellow = 0x0086; // 1 byte
        const SwitchBlockFlagsBlue = 0x0087; // 1 byte
        const SwitchBlockFlagsRed = 0x0088; // 1 byte
        const EmptyRegion = 0x0089; // 3 bytes
        const NumberEventsTriggered = 0x008C; // 1 byte
        const ChecksumComplement = 0x008D // 2 bytes
        const SlotSize = 143;

        let slot = Math.floor(pos / SlotSize);
        let slotPos = pos % SlotSize; // position relative to file
        let region = 0;
        let index = 0;
        let regionText = "";

        if (slotPos >= OverworldLevelSettingFlags && slotPos < OverworldEventFlags) {
            region = OverworldLevelSettingFlags;
            index = slotPos - OverworldLevelSettingFlags;
            regionText = "Level " + this.levelEntrance(index);
        } else if (slotPos >= OverworldEventFlags && slotPos < CurrentSubmapMario) {
            region = OverworldEventFlags;
            index = slotPos - OverworldEventFlags;
            regionText = "Event flags " + index;
        } else if (slotPos == CurrentSubmapMario) {
            region = CurrentSubmapMario;
            index = 0;
            regionText = "Current Submap (Mario)";
        } else if (slotPos == CurrentSubmapLuigi) {
            region = CurrentSubmapLuigi;
            index = 0;
            regionText = "Current Submap (Luigi)";
        } else if (slotPos >= PlayerAnimation && slotPos < OverworldXPosMario) {
            region = PlayerAnimation;
            index = slotPos - PlayerAnimation;
            regionText = "Player animation " + index;
        } else if (slotPos >= OverworldXPosMario && slotPos < OverworldYPosMario) {
            region = OverworldXPosMario;
            index = slotPos - OverworldXPosMario;
            regionText = "Overworld X Position (Mario) " + index;
        } else if (slotPos >= OverworldYPosMario && slotPos < OverworldXPosLuigi) {
            region = OverworldYPosMario;
            index = slotPos - OverworldYPosMario;
            regionText = "Overworld Y Position (Mario) " + index;
        } else if (slotPos >= OverworldXPosLuigi && slotPos < OverworldYPosLuigi) {
            region = OverworldXPosLuigi;
            index = slotPos - OverworldXPosLuigi;
            regionText = "Overworld X Position (Luigi) " + index;
        } else if (slotPos >= OverworldYPosLuigi && slotPos < PointerOverworldXPosMario) {
            region = OverworldYPosLuigi;
            index = slotPos - OverworldYPosLuigi;
            regionText = "Overworld Y Position (Luigi) " + index;
        } else if (slotPos >= PointerOverworldXPosMario && slotPos < PointerOverworldYPosMario) {
            region = PointerOverworldXPosMario;
            index = slotPos - PointerOverworldXPosMario;
            regionText = "Pointer to Overworld X Position (Mario) " + index;
        } else if (slotPos >= PointerOverworldYPosMario && slotPos < PointerOverworldXPosLuigi) {
            region = PointerOverworldYPosMario;
            index = slotPos - PointerOverworldYPosMario;
            regionText = "Pointer to Overworld Y Position (Mario) " + index;
        } else if (slotPos >= PointerOverworldXPosLuigi && slotPos < PointerOverworldYPosLuigi) {
            region = PointerOverworldXPosLuigi;
            index = slotPos - PointerOverworldXPosLuigi;
            regionText = "Pointer to Overworld X Position (Luigi) " + index;
        } else if (slotPos >= PointerOverworldYPosLuigi && slotPos < SwitchBlockFlagsGreen) {
            region = PointerOverworldYPosLuigi;
            index = slotPos - PointerOverworldYPosLuigi;
            regionText = "Pointer to Overworld Y Position (Luigi) " + index;
        } else if (slotPos == SwitchBlockFlagsGreen) {
            region = SwitchBlockFlagsGreen;
            index = 0;
            regionText = "Green Switch Block flag";
        } else if (slotPos == SwitchBlockFlagsYellow) {
            region = SwitchBlockFlagsYellow;
            index = 0;
            regionText = "Yellow Switch Block flag";
        } else if (slotPos == SwitchBlockFlagsBlue) {
            region = SwitchBlockFlagsBlue;
            index = 0;
            regionText = "Blue Switch Block flag";
        } else if (slotPos == SwitchBlockFlagsRed) {
            region = SwitchBlockFlagsRed;
            index = 0;
            regionText = "Red Switch Block flag";
        } else if (slotPos >= EmptyRegion && slotPos < NumberEventsTriggered) {
            region = EmptyRegion;
            index = slotPos - EmptyRegion;
            regionText = "Empty";
        } else if (slotPos == NumberEventsTriggered) {
            region = NumberEventsTriggered;
            index = 0;
            regionText = "Number of Events Triggered";
        } else if (slotPos >= ChecksumComplement && slotPos < SlotSize) {
            region = ChecksumComplement;
            index = slotPos - ChecksumComplement;
            regionText = "Checksum Complement " + index;
        } else {
            region = slotPos;
            index = 0;
            regionText = "Undefined";
        }

        // expose
        this.Slot = slot;
        this.SlotName = this.slotIndexName(this.Slot);
        this.Region = region;
        this.Index = index;
        this.RegionText = regionText;
    }

    slotIndexName(i) {
        switch (i) {
            case 0:
                return "File A";
            case 1:
                return "File B";
            case 2:
                return "File C";
            case 3:
                return "Backup A";
            case 4:
                return "Backup B";
            case 5:
                return "Backup C";
            default:
                return "Undefined";
        }
    }

    levelEntrance(i) {
        // 0x000 - 0x024, 0x101 - 0x13B
        let levelNum = (i > 0x024) ? (0x0DC + i) : i;
        return levelNum.toString(16).padStart(3, "0")
    }
}