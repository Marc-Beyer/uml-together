import { ComponentManager } from "../components/componentManager";
import { ComponentType } from "../components/componentType";
import { Grid } from "../grid";
import { createButtons } from "./buttons";
import { elementToSVG } from "dom-to-svg";
import { ConnectionManager } from "../connections/connectionManager";
import { Global } from "../settings/global";
import { WebSocketController } from "../webSocket/webSocketController";
import JSZip from "jszip";
import { closeModal, showErrorWithReload, showLoading, showModal } from "../modal/main";
import { openSettings } from "../settings/settings";

import classIcon from "/img/class-icon.svg";
import interfaceIcon from "/img/interface-icon.svg";
import enumIcon from "/img/enum-icon.svg";
import primitiveIcon from "/img/primitive-icon.svg";
import dataTypeIcon from "/img/dataType-icon.svg";
import noteIcon from "/img/note-icon.svg";
import associationIcon from "/img/association-icon.svg";
import directedAssociationIcon from "/img/directed-association-icon.svg";
import generalizationIcon from "/img/generalization-icon.svg";
import composition from "/img/composition-icon.svg";
import aggregationIcon from "/img/aggregation-icon.svg";
import usageIcon from "/img/usage-icon.svg";
import realizationIcon from "/img/realization-icon.svg";

import transparentLightImg from "/img/transparent-light.png";
import transparentDarkImg from "/img/transparent-dark.png";
import { Component } from "../components/component";
import { Connection } from "../connections/connection";

const componentContainer = document.getElementById("component-container") as HTMLDivElement;
const mainCanvas = document.getElementById("main-canvas") as HTMLCanvasElement;

const imageDelay = 500;

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
        {
            text: "Directed Association",
            id: "directed-associationClass",
            type: ComponentType.DIRECTED_ASSOCIATION,
            icon: directedAssociationIcon,
        },
        { text: "Generalization", id: "generalizationClass", type: ComponentType.GENERALIZATION, icon: generalizationIcon },
        { text: "Composition", id: "composition", type: ComponentType.COMPOSITION, icon: composition },
        { text: "Aggregation", id: "aggregation", type: ComponentType.AGGREGATION, icon: aggregationIcon },
        { text: "Realization", id: "realization", type: ComponentType.REALIZATION, icon: realizationIcon },
        { text: "Usage", id: "usage", type: ComponentType.USAGE, icon: usageIcon },
    ],
};

async function takeImageAt(x: number, y: number): Promise<string> {
    Grid.xOffset = x;
    Grid.yOffset = y;
    Grid.addZoom(0, 0);

    await delay(imageDelay);

    componentContainer.classList.add("generate-img");

    const svgDocument = elementToSVG(componentContainer);
    const svgString = new XMLSerializer().serializeToString(svgDocument);

    let svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    let domURL = self.URL || self.webkitURL || self;
    let url = domURL.createObjectURL(svg);
    let img = new Image();

    img.src = url;

    return new Promise((resolve, reject) => {
        img.addEventListener("load", async () => {
            Grid.ctx.drawImage(img, 0, 0);
            domURL.revokeObjectURL(url);
            const canvasUrl = mainCanvas.toDataURL("image/png");
            resolve(canvasUrl);
        });
        img.addEventListener("error", reject);
    });
}

export function initialize() {
    const nav = document.getElementById("main-nav");

    document.getElementById("nav-btn")?.addEventListener("click", () => {
        nav?.classList.toggle("closed");
    });
    createButtons(mockupDiagram);

    document.getElementById("nav-btn-new-session")?.addEventListener("click", () => {
        window.location.href = `/`;
    });
    document.getElementById("nav-btn-save-sever")?.addEventListener("click", async () => {
        WebSocketController.instance.sentSaveMessage();

        showLoading("Saving on Server...");
        await delay(1000);
        closeModal();
    });
    document.getElementById("nav-btn-export-img-json")?.addEventListener("click", async () => {
        showLoading("Exporting Image...");

        const diagramSize = ComponentManager.instance.getDiagramSize();
        if (
            diagramSize.top === undefined ||
            diagramSize.left === undefined ||
            diagramSize.right === undefined ||
            diagramSize.bottom === undefined
        ) {
            showErrorWithReload("Could not find diagram!");
            return;
        }

        Component.resetActiveComponents();
        Connection.resetActiveConnections();

        Grid.xZoom = Global.IMG_EXP_ZOOM;
        Grid.yZoom = Global.IMG_EXP_ZOOM;
        Grid.addZoom(0, 0);

        const startX = -diagramSize.left - Grid.width / (2 * Global.IMG_EXP_ZOOM) + Global.IMG_EXP_LEFT_OFFSET;
        const startY = -diagramSize.top - Grid.height / (2 * Global.IMG_EXP_ZOOM) + Global.IMG_EXP_TOP_OFFSET;
        const endX = -diagramSize.right + Grid.width / (2 * Global.IMG_EXP_ZOOM) - Global.IMG_EXP_LEFT_OFFSET - Global.IMG_EXP_RIGHT_OFFSET;
        const endY =
            -diagramSize.bottom + Grid.height / (2 * Global.IMG_EXP_ZOOM) - Global.IMG_EXP_TOP_OFFSET - Global.IMG_EXP_BOTTOM_OFFSET;
        const stepX = 2 * (Grid.width / (2 * Global.IMG_EXP_ZOOM));
        const stepY = 2 * (Grid.height / (2 * Global.IMG_EXP_ZOOM));
        const imgNrX = Math.ceil((startX - endX) / stepX) + 1;
        const imgNrY = Math.ceil((startY - endY) / stepY) + 1;

        const canvas = document.createElement("canvas");
        canvas.style.backgroundImage = `url(${Global.DARK_MODE ? transparentDarkImg : transparentLightImg})`;
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
            showErrorWithReload("Could not create canvas!");
            return;
        }

        canvas.width = ((startX - endX) / stepX + 1) * Grid.width;
        canvas.height = ((startY - endY) / stepY + 1) * Grid.height;

        const modal = document.getElementById("modal-content") as HTMLDivElement;
        const modalPrimaryBtn = document.getElementById("modal-primary-btn") as HTMLButtonElement;
        const modalSecondaryBtn = document.getElementById("modal-secondary-btn") as HTMLButtonElement;
        const modalCloseBtn = document.getElementById("modal-close-btn") as HTMLButtonElement;

        let cancel = false;

        modal?.append(canvas);
        if (modalPrimaryBtn) {
            modalPrimaryBtn.style.display = "";
            modalPrimaryBtn.textContent = "Download Image";
            modalPrimaryBtn.disabled = true;
        }
        if (modalSecondaryBtn) {
            modalSecondaryBtn.style.display = "";
            modalSecondaryBtn.textContent = "Cancel";
            modalSecondaryBtn.addEventListener("click", () => {
                closeModal();
                cancel = true;
            });
        }
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener("click", () => {
                closeModal();
                cancel = true;
            });
        }

        for (let x = 0; x < imgNrX; x++) {
            for (let y = 0; y < imgNrY; y++) {
                if (cancel) {
                    Grid.xZoom = 1;
                    Grid.yZoom = 1;
                    Grid.xOffset = 0;
                    Grid.yOffset = 0;
                    Grid.addZoom(0, 0);
                    componentContainer.classList.remove("generate-img");
                    return;
                }
                await takeImageAt(startX - stepX * x, startY - stepY * y);
                ctx.drawImage(mainCanvas, x * Grid.width, y * Grid.height);
            }
        }

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${Global.FILE_NAME.trim().length > 0 ? Global.FILE_NAME : "UML-Together"}.png`;
        document.body.appendChild(link);

        modalPrimaryBtn?.addEventListener("click", async () => {
            link.click();
            await delay(1000);
            link.remove();
            closeModal();
        });
        modalPrimaryBtn.disabled = false;

        document.querySelector("#modal-content .loading")?.remove();

        Grid.xZoom = 1;
        Grid.yZoom = 1;
        Grid.xOffset = 0;
        Grid.yOffset = 0;
        Grid.addZoom(0, 0);

        await delay(1000);
        componentContainer.classList.remove("generate-img");
    });
    document.getElementById("nav-btn-export-json")?.addEventListener("click", async () => {
        showLoading("Exporting...");
        const components = ComponentManager.instance.getState();
        const connections = ConnectionManager.instance.getState();

        const data = {
            components,
            connections,
        };

        downloadFile(data, `${Global.FILE_NAME === "" ? "uml-together" : Global.FILE_NAME}.json`);

        await delay(1000);
        closeModal();
    });
    document.getElementById("nav-btn-import-json")?.addEventListener("click", () => {
        showLoading("Importing JSON...");
        document.getElementById("upload-input")?.click();
    });
    document.getElementById("upload-input")?.addEventListener("change", async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
            console.log("Selected file:", file);
            const reader = new FileReader();
            reader.readAsText(file);

            reader.onload = (event: ProgressEvent<FileReader>) => {
                let result = event.target?.result;
                if (result === null || result === undefined) return;
                if (result instanceof ArrayBuffer) {
                    result = new TextDecoder().decode(result);
                }
                const jsonResult = JSON.parse(result);
                console.log("File content:", result);

                ComponentManager.instance.onStateMessage(jsonResult);
                ConnectionManager.instance.onStateMessage(jsonResult);
            };
            await delay(1000);
            closeModal();
        }
    });
    document.getElementById("nav-btn-generate-code")?.addEventListener("click", async () => {
        showLoading("Generating Source Code...");

        const codes = ComponentManager.instance.getCode();
        const zip = new JSZip();

        console.log(`Generated code of ${codes.length}. classes`);

        for (let index = 0; index < codes.length; index++) {
            const element = codes[index];
            console.log(element.name, element.code);

            const blob = new Blob([element.code], { type: "text/plain" });
            zip.file(element.name, blob);
        }

        zip.generateAsync({ type: "blob" }).then(async (content) => {
            const url = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = url;

            link.download = `${Global.FILE_NAME === "" ? "uml-together" : Global.FILE_NAME}.zip`;
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);

            await delay(1000);
            closeModal();
        });
    });

    document.getElementById("nav-btn-settings")?.addEventListener("click", () => {
        openSettings();
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
    document.getElementById("nav-btn-copy-link")?.addEventListener("click", async () => {
        showModal("Copied link to clipboard!", "Others can join and edit the diagram via this link.");
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

export async function downloadFile(data: any, fileName: string = "uml-together", fileType = "application/json") {
    const fileData = JSON.stringify(data);

    const blob = new Blob([fileData], { type: fileType });
    let domURL = self.URL || self.webkitURL || self;
    const url = domURL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    await delay(1000);
    link.remove();
}

export async function delay(ms: number) {
    await new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
