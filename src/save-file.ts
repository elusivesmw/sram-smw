

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

const SlotSize = 143;



export class SaveFile {
    private _bytes: Uint8Array;
    private _bytesOriginal: Uint8Array;
    [i: number]: number;

    constructor (bytes: Uint8Array) {
        this._bytes = bytes;
        this._bytesOriginal = this._bytes.slice(0); // copy of values
    }

    // public get bytes() {
    //     return this._bytes;
    // }

    // public get bytesOriginal() {
    //     return this._bytesOriginal;
    // }

    public getByte(i: number) {
        return this._bytes[i];
    }
    public setByte(i: number, val: number) {
        this._bytes[i] = val;
    }
    public get length() {
        return this._bytes.length;
    }

    toBlob() {
        return new Blob([this._bytes], {type: "application/octet-stream"});
    }

    diffAt(i: number) {
        return (this._bytes[i] !== this._bytesOriginal[i]);
    }

    getSlotAddress(slot: number) {
        return slot * SlotSize;
    }


    getLevelNum(i: number) {
        // 0x000 - 0x024, 0x101 - 0x13B
        let levelNum = (i > 0x024) ? (0x0DC + i) : i;
        return levelNum.toString(16).padStart(3, "0")
    }

    getLevelIndex(level: number) {
        let levelIndex = (level > 0x100) ? (level - 0x0DC) : level;
        return levelIndex;
    }

    setLevelBit(slot: number, levelNum: number, bit: number, val: boolean) {
        let slotAddress = this.getSlotAddress(slot);
        let levelIndex = this.getLevelIndex(levelNum);
        let levelAddress = slotAddress + levelIndex;

        let byte = this._bytes[levelAddress];
        byte = setBit(byte, bit, val);
        this._bytes[levelAddress] = byte;
    }



    // set level bits
    setLevelPassed(slot: number, levelNum: number, val: boolean) {
        const LevelPassedBit = 7;
        return this.setLevelBit(slot, levelNum, LevelPassedBit, val);
    }
    setMidwayPassed(slot: number, levelNum: number, val: boolean) {
        const LevelMidwayBit = 6;
        return this.setLevelBit(slot, levelNum, LevelMidwayBit, val);
    }
    setNoEntry(slot: number, levelNum: number, val: boolean) {
        const NoEntryBit = 5;
        return this.setLevelBit(slot, levelNum, NoEntryBit, val);
    }
    setSavePrompt(slot: number, levelNum: number, val: boolean) {
        const SavePromptBit = 4;
        return this.setLevelBit(slot, levelNum, SavePromptBit, val);
    }
    setUp(slot: number, levelNum: number, val: boolean) {
        const UpBit = 3;
        return this.setLevelBit(slot, levelNum, UpBit, val);
    }
    setDown(slot: number, levelNum: number, val: boolean) {
        const DownBit = 2;
        return this.setLevelBit(slot, levelNum, DownBit, val);
    }
    setLeft(slot: number, levelNum: number, val: boolean) {
        const LeftBit = 1;
        return this.setLevelBit(slot, levelNum, LeftBit, val);
    }
    setRight(slot: number, levelNum: number, val: boolean) {
        const RightBit = 0;
        return this.setLevelBit(slot, levelNum, RightBit, val);
    }
}

function setBit(byte: number, bit: number, val: boolean) {
    const ByteMax = 0xFF;
    let bitVal = 1 << bit; 
    if (val) {
        // set bit
        byte |= bitVal;
    } else {
        // clean bit
        byte &= ~bitVal;
    }
    return ByteMax & byte;
}

// sramFile.setLevelBit(0, 0, 0, true);
// sramFile.setLevelBit(0, 0, 1, true);
// sramFile.setLevelBit(0, 0, 2, true);
// sramFile.setLevelBit(0, 0, 3, true);
// sramFile.setLevelBit(0, 0, 4, true);
// sramFile.setLevelBit(0, 0, 5, true);
// sramFile.setLevelBit(0, 0, 6, true);
// sramFile.setLevelBit(0, 0, 7, true);