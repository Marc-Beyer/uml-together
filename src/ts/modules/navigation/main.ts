import { Component } from "../components/component";
import { ComponentManager } from "../components/componentManager";
import { ComponentType } from "../components/componentType";
import { Grid } from "../grid";
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
        { text: "Association", id: "associationClass", type: ComponentType.ASSOCIATION, icon: "img/association-icon.svg" },
        { text: "Generalization", id: "generalizationClass", type: ComponentType.GENERALIZATION, icon: "img/generalization-icon.svg" },
        { text: "Composition", id: "composition", type: ComponentType.COMPOSITION, icon: "img/composition-icon.svg" },
        { text: "Aggregation", id: "aggregation", type: ComponentType.AGGREGATION, icon: "img/aggregation.icon.svg" },
        { text: "Usage", id: "usage", type: ComponentType.USAGE, icon: "img/usage-icon.svg" },
    ],
};

export function initialize() {
    const nav = document.getElementById("main-nav");

    document.getElementById("nav-btn")?.addEventListener("click", () => {
        nav?.classList.toggle("closed");
    });
    createButtons(mockupDiagram);

    let settingsModal = document.getElementById("settings-modal");

    document.getElementById("nav-btn-new-session")?.addEventListener("click", () => {});
    document.getElementById("nav-btn-save-sever")?.addEventListener("click", () => {});
    document.getElementById("nav-btn-export-json")?.addEventListener("click", () => {});
    document.getElementById("nav-btn-import-json")?.addEventListener("click", () => {});
    document.getElementById("nav-btn-settings")?.addEventListener("click", () => {
        if (settingsModal) settingsModal.style.display = "block";
    });
    document.getElementById("nav-btn-center-view")?.addEventListener("click", () => {
        Grid.resetOffset();
    });
    document.getElementById("nav-btn-reset-zoom")?.addEventListener("click", () => {
        Grid.resetZoom();
    });
    document.getElementById("nav-btn-resize-all")?.addEventListener("click", () => {
        ComponentManager.instance.autoResizeAll();
    });
    document.getElementById("nav-btn-reset-file")?.addEventListener("click", () => {});
    document.getElementById("nav-btn-copy-link")?.addEventListener("click", () => {
        const currentUrl = window.location.href;

        navigator.clipboard
            .writeText(currentUrl)
            .then(() => {
                console.log("Text copied to clipboard");
            })
            .catch((error) => {
                console.error("Failed to copy text: ", error);
            });
    });
}
