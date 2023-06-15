import { Grid } from "../grid";
import { MessageType, SettingsMessage } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
import { Global, ProgrammingLanguage } from "./global";

const filenameInput = document.getElementById("settings-filename") as HTMLInputElement;
const programmingLangSelect = document.getElementById("settings-programming-language") as HTMLSelectElement;
const gridInput = document.getElementById("settings-grid") as HTMLInputElement;
const settingsModal = document.getElementById("settings-modal") as HTMLDialogElement;
const storeLocallyToggle = document.getElementById("settings-store-locally") as HTMLInputElement;

const imgExportZoom = document.getElementById("settings-ei-zoom") as HTMLInputElement;
const imgExportLeftOffset = document.getElementById("settings-ei-left-offset") as HTMLInputElement;
const imgExportRightOffset = document.getElementById("settings-ei-right-offset") as HTMLInputElement;
const imgExportTopOffset = document.getElementById("settings-ei-top-offset") as HTMLInputElement;
const imgExportBottomOffset = document.getElementById("settings-ei-bottom-offset") as HTMLInputElement;
const imgExportBackgroundColor = document.getElementById("settings-ei-background-color") as HTMLInputElement;
const imgExportBackgroundAlpha = document.getElementById("settings-ei-bg-alpha") as HTMLInputElement;
const imgExportDelay = document.getElementById("settings-ei-delay") as HTMLInputElement;

const imgExportSettings = document.getElementById("img-export-settings") as HTMLDivElement;
const generalSettings = document.getElementById("general-settings") as HTMLDivElement;
const imgExportSettingsBtn = document.getElementById("img-export-settings-btn") as HTMLButtonElement;
const generalSettingsBtn = document.getElementById("general-settings-btn") as HTMLButtonElement;

export function initSettings() {
    imgExportSettings.style.display = "none";
    generalSettingsBtn.classList.add("highlighted");
    generalSettingsBtn.addEventListener("click", () => {
        generalSettingsBtn.classList.add("highlighted");
        imgExportSettingsBtn.classList.remove("highlighted");
        imgExportSettings.style.display = "none";
        generalSettings.style.display = "";
    });
    imgExportSettingsBtn.addEventListener("click", () => {
        imgExportSettingsBtn.classList.add("highlighted");
        generalSettingsBtn.classList.remove("highlighted");
        imgExportSettings.style.display = "";
        generalSettings.style.display = "none";
    });

    const darkModeInput = document.getElementById("settings-dark-mode") as HTMLInputElement;

    const quickDarkModeInput = document.getElementById("quick-settings-dark-mode") as HTMLInputElement;

    quickDarkModeInput.addEventListener("change", () => {
        Global.DARK_MODE = quickDarkModeInput.checked;
    });

    document.getElementById("settings-modal-close")?.addEventListener("click", () => {
        settingsModal.close();
    });
    document.getElementById("settings-modal-save-btn")?.addEventListener("click", () => {
        settingsModal.close();

        // General settings
        Global.FILE_NAME = filenameInput.value;
        Global.PROGRAMMING_LANG = programmingLangSelect.selectedIndex;
        Grid.xRaster = toNumberOrDefault(gridInput.value);
        Grid.yRaster = toNumberOrDefault(gridInput.value);
        Global.STORED_LOCALLY = storeLocallyToggle.checked;
        Global.DARK_MODE = darkModeInput.checked;

        // Export image settings
        Global.IMG_EXP_ZOOM = toNumberOrDefault(imgExportZoom.value, Grid.zoomMin) * ((Grid.zoomMax - Grid.zoomMin) / 100) + Grid.zoomMin;
        Global.IMG_EXP_LEFT_OFFSET = toNumberOrDefault(imgExportLeftOffset.value);
        Global.IMG_EXP_RIGHT_OFFSET = toNumberOrDefault(imgExportRightOffset.value);
        Global.IMG_EXP_TOP_OFFSET = toNumberOrDefault(imgExportTopOffset.value);
        Global.IMG_EXP_BOTTOM_OFFSET = toNumberOrDefault(imgExportBottomOffset.value);
        Global.IMG_EXP_BACKGROUND_COLOR = imgExportBackgroundColor.value;
        Global.IMG_EXP_BACKGROUND_ALPHA = toNumberOrDefault(imgExportBackgroundAlpha.value);
        Global.IMG_EXP_DELAY = toNumberOrDefault(imgExportDelay.value);

        sendSettingsMessage();
    });

    filenameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            document.getElementById("settings-modal-save-btn")?.focus();
        }
    });

    // General settings
    filenameInput.value = Global.FILE_NAME;
    storeLocallyToggle.checked = Global.STORED_LOCALLY;
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
    imgExportZoom.value = ((Global.IMG_EXP_ZOOM - Grid.zoomMin) * (100 / (Grid.zoomMax - Grid.zoomMin))).toString();

    // Export image settings
    imgExportLeftOffset.value = Global.IMG_EXP_LEFT_OFFSET.toString();
    imgExportRightOffset.value = Global.IMG_EXP_RIGHT_OFFSET.toString();
    imgExportTopOffset.value = Global.IMG_EXP_TOP_OFFSET.toString();
    imgExportBottomOffset.value = Global.IMG_EXP_BOTTOM_OFFSET.toString();
    imgExportBackgroundColor.value = Global.IMG_EXP_BACKGROUND_COLOR;
    imgExportBackgroundAlpha.value = Global.IMG_EXP_BACKGROUND_ALPHA.toString();
    imgExportDelay.value = Global.IMG_EXP_DELAY.toString();
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
    settingsModal.showModal();
    filenameInput.focus();
}

function toNumberOrDefault(str: string, defaultValue: number = 0) {
    const num = Number(str);
    return isNaN(num) ? defaultValue : num;
}
