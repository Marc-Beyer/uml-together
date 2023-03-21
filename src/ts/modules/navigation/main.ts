import { ComponentType } from "../components/componentType";
import { createButtons } from "./buttons";

export interface Diagram {
    id: number;
    title: string;
    buttons: DiagramButton[];
}

//The text will be displayed in the nav for the user
//The id is intern to identify the button
export interface DiagramButton {
    text: string;
    id: string;
    type: ComponentType;
    icon?: string;
}

//Data from DB
let mockupDiagram: Diagram = {
    id: 0,
    title: "ClassDiagram",
    buttons: [
        { text: "Class", id: "class", type: ComponentType.CLASS, icon: "img/class-icon.svg" },
        { text: "Interface", id: "interface", type: ComponentType.INTERFACE, icon: "img/interface-icon.svg" },
        { text: "Enumeration", id: "enumeration", type: ComponentType.ENUM, icon: "img/enum-icon.svg" },
        { text: "Primitive", id: "primitive", type: ComponentType.PRIMITIVE, icon: "img/primitive-icon.svg" },
        { text: "DataType", id: "dataType", type: ComponentType.DATA_TYPE, icon: "img/dataType-icon.svg" },
        { text: "Note", id: "note", type: ComponentType.NOTE, icon: "img/note-icon.svg" },
        { text: "Generalization", id: "generalizationClass", type: ComponentType.GENERALIZATION },
        { text: "Usage", id: "usage", type: ComponentType.USAGE },
        { text: "Association", id: "associationClass", type: ComponentType.ASSOCIATION },
        { text: "Aggregation", id: "aggregation", type: ComponentType.AGGREGATION },
        { text: "Composition", id: "composition", type: ComponentType.COMPOSITION },
    ],
};

export function initialize() {
    const nav = document.getElementById("main-nav");

    document.getElementById("nav-btn")?.addEventListener("click", () => {
        nav?.classList.toggle("closed");
    });
    createButtons(mockupDiagram);
}
