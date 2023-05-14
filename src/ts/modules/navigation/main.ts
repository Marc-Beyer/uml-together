import { ComponentManager } from "../components/componentManager";
import { ComponentType } from "../components/componentType";
import { Grid } from "../grid";
import { createButtons } from "./buttons";

import classIcon from "/img/class-icon.svg";
import interfaceIcon from "/img/interface-icon.svg";
import enumIcon from "/img/enum-icon.svg";
import primitiveIcon from "/img/primitive-icon.svg";
import dataTypeIcon from "/img/dataType-icon.svg";
import noteIcon from "/img/note-icon.svg";
import associationIcon from "/img/association-icon.svg";
import generalizationIcon from "/img/generalization-icon.svg";
import composition from "/img/composition-icon.svg";
import aggregationIcon from "/img/aggregation.icon.svg";
import usageIcon from "/img/usage-icon.svg";
import { ConnectionManager } from "../connections/connectionManager";

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
        { text: "Class", id: "class", type: ComponentType.CLASS, icon: classIcon },
        { text: "Interface", id: "interface", type: ComponentType.INTERFACE, icon: interfaceIcon },
        { text: "Enumeration", id: "enumeration", type: ComponentType.ENUM, icon: enumIcon },
        { text: "Primitive", id: "primitive", type: ComponentType.PRIMITIVE, icon: primitiveIcon },
        { text: "DataType", id: "dataType", type: ComponentType.DATA_TYPE, icon: dataTypeIcon },
        { text: "Note", id: "note", type: ComponentType.NOTE, icon: noteIcon },
        { text: "Association", id: "associationClass", type: ComponentType.ASSOCIATION, icon: associationIcon },
        { text: "Generalization", id: "generalizationClass", type: ComponentType.GENERALIZATION, icon: generalizationIcon },
        { text: "Composition", id: "composition", type: ComponentType.COMPOSITION, icon: composition },
        { text: "Aggregation", id: "aggregation", type: ComponentType.AGGREGATION, icon: aggregationIcon },
        { text: "Usage", id: "usage", type: ComponentType.USAGE, icon: usageIcon },
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
    document.getElementById("nav-btn-export-json")?.addEventListener("click", () => {
        const components = ComponentManager.instance.getState();
        const connections = ConnectionManager.instance.getState();

        const data = {
            components,
            connections,
        };

        const fileData = JSON.stringify(data);
        const fileName = "data.json";
        const fileType = "application/json";

        const blob = new Blob([fileData], { type: fileType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
    });
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
