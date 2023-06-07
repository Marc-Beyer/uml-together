import { Grid } from "../grid";
import { saveLocalSettings } from "./settings";

export interface ProgrammingLanguageOptions {
    defaultVisibility: "";
    operationBody: "";
}

export enum ProgrammingLanguage {
    "CSharp",
    "Java",
    "JavaScript",
    "TypeScript",
}

export class Global {
    public static PROGRAMMING_LANG: ProgrammingLanguage = ProgrammingLanguage.Java;
    public static USE_ENCRYPTION = true;
    public static CONNECTION_SELECT_TOLERANCE = 15;
    public static SESSION_ID = "";
    public static KEY = "";

    private static fileName = "";
    public static get FILE_NAME() {
        return Global.fileName;
    }
    public static set FILE_NAME(value) {
        Global.fileName = value;
        Global.updateFileName();
        saveLocalSettings();
    }

    private static darkMode: boolean = false;
    public static get DARK_MODE() {
        return Global.darkMode;
    }

    public static set DARK_MODE(value: boolean) {
        Global.darkMode = value;
        Global.updateDarkMode();
        saveLocalSettings();
    }

    public static INIT(sessionId: string, key: string) {
        this.SESSION_ID = sessionId;
        Global.KEY = key;
        const storedString = localStorage.getItem(sessionId);
        console.log("STORED VALUES storedString", storedString);
        if (storedString === null || storedString.trim().length < 1) {
            Global.DARK_MODE = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
            return;
        }
        const stored = JSON.parse(storedString);

        console.log("STORED VALUES", stored);

        Global.darkMode = stored.DARK_MODE ?? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
        Global.fileName = stored.FILE_NAME ?? "";

        Global.updateDarkMode();
        Global.updateFileName();
    }

    private static updateFileName() {
        if (Global.FILE_NAME.trim().length > 1) {
            document.title = `${Global.FILE_NAME}`;
        } else {
            document.title = `UML Together`;
        }
    }

    private static updateDarkMode() {
        if (Global.DARK_MODE) {
            Grid.backgroundColor = "#181a1b";
            Grid.lineColorSelected = "red";
            Grid.lineColor = "white";
            document.body.classList.add("dark-mode");
        } else {
            Grid.lineColor = "black";
            Grid.lineColorSelected = "red";
            Grid.backgroundColor = "white";
            document.body.classList.remove("dark-mode");
        }
        (document.getElementById("quick-settings-dark-mode") as HTMLInputElement).checked = Global.DARK_MODE;
        (document.getElementById("settings-dark-mode") as HTMLInputElement).checked = Global.DARK_MODE;
        Grid.updateConnections();
    }

    constructor() {}
}
