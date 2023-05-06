
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


export class FileData {
    static SlotSize = 143;
    static ChecksumComplement = 0x008D // 2 bytes

    static getSlot(pos: number) {
        return Math.floor(pos / FileData.SlotSize);
    }
    static getSlotPos(pos: number) {
        return pos % FileData.SlotSize;
    }

    Slot: number;
    SlotName: string;
    Region: number;
    Index: number;
    RegionText: string;
    
    constructor (pos: number) {
        let slot = FileData.getSlot(pos);
        let slotPos = FileData.getSlotPos(pos); // position relative to file
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
        } else if (slotPos >= FileData.ChecksumComplement && slotPos < FileData.SlotSize) {
            region = FileData.ChecksumComplement;
            index = slotPos - FileData.ChecksumComplement;
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

    slotIndexName(i: number) {
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

    levelEntrance(i: number) {
        // 0x000 - 0x024, 0x101 - 0x13B
        let levelNum = (i > 0x024) ? (0x0DC + i) : i;
        return levelNum.toString(16).padStart(3, "0")
    }
}