import { Grid } from "../grid";

export enum ProgrammingLanguage {
    "CSharp",
    "Java",
    "JavaScript",
    "TypeScript",
}

export class Global {
    public static FILE_NAME = "";
    public static PROGRAMMING_LANG: ProgrammingLanguage = ProgrammingLanguage.Java;
    public static USE_ENCRYPTION = true;
    public static CONNECTION_SELECT_TOLERANCE = 15;

    private static _DarkMode: boolean = false;
    public static get DARK_MODE() {
        return Global._DarkMode;
    }
    public static set DARK_MODE(value: boolean) {
        Global._DarkMode = value;

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
        Grid.updateConnections();
    }

    constructor() {}
}

export function initGlobalValues() {
    Global.DARK_MODE = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
