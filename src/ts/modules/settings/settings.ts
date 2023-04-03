import { Grid } from "../grid";
import { Global, ProgrammingLanguage } from "./global";

export function initSettings() {
    const settingsModal = document.getElementById("settings-modal");
    const filenameInput = document.getElementById("settings-filename") as HTMLInputElement;
    const programmingLangSelect = document.getElementById("settings-programming-language") as HTMLSelectElement;
    const gridInput = document.getElementById("settings-grid") as HTMLInputElement;
    const darkModeInput = document.getElementById("settings-dark-mode") as HTMLInputElement;

    document.getElementById("settings-modal-close")?.addEventListener("click", () => {
        if (settingsModal) settingsModal.style.display = "";
    });
    document.getElementById("settings-modal-save-btn")?.addEventListener("click", () => {
        if (settingsModal) settingsModal.style.display = "";

        Global.FILE_NAME = filenameInput.value;
        Global.PROGRAMMING_LANG = programmingLangSelect.selectedIndex;
        Grid.xRaster = gridInput.checked ? 10 : 0;
        Grid.yRaster = gridInput.checked ? 10 : 0;
        Global.DARK_MODE = darkModeInput.checked;
    });

    filenameInput.value = Global.FILE_NAME;

    for (const key in ProgrammingLanguage) {
        if (Object.prototype.hasOwnProperty.call(ProgrammingLanguage, key) && typeof ProgrammingLanguage[key] === "string") {
            const option = document.createElement("option");
            option.append(document.createTextNode(ProgrammingLanguage[key]));
            programmingLangSelect.append(option);
        }
    }
    programmingLangSelect.selectedIndex = Global.PROGRAMMING_LANG;

    gridInput.checked = Grid.xRaster > 0;
    darkModeInput.checked = Global.DARK_MODE;
}
