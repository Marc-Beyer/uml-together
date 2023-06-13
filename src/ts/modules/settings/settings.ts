import { Grid } from "../grid";
import { MessageType, SettingsMessage } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
import { Global, ProgrammingLanguage } from "./global";

const filenameInput = document.getElementById("settings-filename") as HTMLInputElement;
const programmingLangSelect = document.getElementById("settings-programming-language") as HTMLSelectElement;
const gridInput = document.getElementById("settings-grid") as HTMLInputElement;
const settingsModal = document.getElementById("settings-modal");
const storeLocallyToggle = document.getElementById("settings-store-locally") as HTMLInputElement;

export function initSettings() {
    const darkModeInput = document.getElementById("settings-dark-mode") as HTMLInputElement;

    const quickDarkModeInput = document.getElementById("quick-settings-dark-mode") as HTMLInputElement;

    quickDarkModeInput.addEventListener("change", () => {
        Global.DARK_MODE = quickDarkModeInput.checked;
    });

    document.getElementById("settings-modal-close")?.addEventListener("click", () => {
        if (settingsModal) settingsModal.style.display = "";
    });
    document.getElementById("settings-modal-save-btn")?.addEventListener("click", () => {
        if (settingsModal) settingsModal.style.display = "";

        Global.FILE_NAME = filenameInput.value;
        Global.PROGRAMMING_LANG = programmingLangSelect.selectedIndex;
        Grid.xRaster = Number(gridInput.value);
        Grid.yRaster = Number(gridInput.value);
        if (isNaN(Grid.xRaster)) {
            Grid.xRaster = 0;
            Grid.yRaster = 0;
        }
        Global.STORED_LOCALLY = storeLocallyToggle.checked;
        Global.DARK_MODE = darkModeInput.checked;
        sendSettingsMessage();
    });

    filenameInput.value = Global.FILE_NAME;
    storeLocallyToggle.checked = Global.STORED_LOCALLY;
    console.log("STORED_LOCALLY", Global.STORED_LOCALLY);

    for (const key in ProgrammingLanguage) {
        if (Object.prototype.hasOwnProperty.call(ProgrammingLanguage, key) && typeof ProgrammingLanguage[key] === "string") {
            const option = document.createElement("option");
            option.append(document.createTextNode(ProgrammingLanguage[key]));
            programmingLangSelect.append(option);
        }
    }
    programmingLangSelect.selectedIndex = Global.PROGRAMMING_LANG;

    gridInput.value = Grid.xRaster + "";
    darkModeInput.checked = Global.DARK_MODE;
}

export function getSettingState(): SettingsMessage {
    return {
        FILE_NAME: Global.FILE_NAME,
        PROGRAMMING_LANG: Global.PROGRAMMING_LANG,
        xRaster: Grid.xRaster,
        yRaster: Grid.yRaster,
    };
}

export function sendSettingsMessage() {
    WebSocketController.instance.sent({
        type: MessageType.SETTINGS,
        data: getSettingState(),
    });
}

export function onSettingsMessage(message: SettingsMessage) {
    Global.FILE_NAME = message.FILE_NAME;
    Global.PROGRAMMING_LANG = message.PROGRAMMING_LANG;
    Grid.xRaster = message.xRaster;
    Grid.yRaster = message.yRaster;
    console.log("onSettingsMessage", message);

    filenameInput.value = Global.FILE_NAME;
    programmingLangSelect.selectedIndex = Global.PROGRAMMING_LANG;
    gridInput.value = `${Grid.xRaster}`;
}

export interface StoredObject {
    DARK_MODE: boolean;
    FILE_NAME?: string;
    KEY?: string;
    STORED_LOCALLY?: boolean;
}

export function saveLocalSettings() {
    let stored: StoredObject = {
        DARK_MODE: Global.DARK_MODE,
    };

    if (Global.STORED_LOCALLY) {
        stored.FILE_NAME = Global.FILE_NAME;
        stored.KEY = Global.KEY;
    } else {
        stored.STORED_LOCALLY = Global.STORED_LOCALLY;
    }

    localStorage.setItem(Global.SESSION_ID, JSON.stringify(stored));
    console.log("SAVE", stored);
    console.log("SAVE", localStorage.getItem(Global.SESSION_ID));
}

export function openSettings() {
    if (settingsModal) settingsModal.style.display = "block";
}
