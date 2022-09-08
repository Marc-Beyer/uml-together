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
}

//Data from DB
let mockupDiagramm: Diagram = {
    id: 0,
    title: "ClassDiagram",
    buttons: [
        { text: "Class", id: "class" },
        { text: "Interface", id: "interface" },
        { text: "Enumeration", id: "enumeration" },
        { text: "Primitive", id: "primitive" },
        { text: "Generalization", id: "generalizationClass" },
        { text: "Usage", id: "usage" },
        { text: "Association", id: "associationClass" },
        { text: "Aggregation", id: "aggregation" },
        { text: "Composition", id: "composition" },
    ],
};

export function initialize() {
    const nav = document.getElementById("main-nav");

    document.getElementById("nav-btn")?.addEventListener("click", () => {
        nav?.classList.toggle("closed");
    });
    createButtons(mockupDiagramm);
}
