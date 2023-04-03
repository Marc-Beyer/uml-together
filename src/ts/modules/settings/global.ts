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
    public static DARK_MODE: boolean = false;

    constructor() {}
}
