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
}

//Data from DB
let mockupDiagram: Diagram = {
    id: 0,
    title: "ClassDiagram",
    buttons: [
        { text: "Class", id: "class", type: ComponentType.CLASS },
        { text: "Interface", id: "interface", type: ComponentType.DEFAULT },
        { text: "Enumeration", id: "enumeration", type: ComponentType.DEFAULT },
        { text: "Primitive", id: "primitive", type: ComponentType.DEFAULT },
        { text: "Generalization", id: "generalizationClass", type: ComponentType.DEFAULT },
        { text: "Usage", id: "usage", type: ComponentType.DEFAULT },
        { text: "Association", id: "associationClass", type: ComponentType.DEFAULT },
        { text: "Aggregation", id: "aggregation", type: ComponentType.DEFAULT },
        { text: "Composition", id: "composition", type: ComponentType.DEFAULT },
    ],
};

export function initialize() {
    const nav = document.getElementById("main-nav");

    document.getElementById("nav-btn")?.addEventListener("click", () => {
        nav?.classList.toggle("closed");
    });
    createButtons(mockupDiagram);
}
