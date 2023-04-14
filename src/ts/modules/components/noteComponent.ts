import { Grid } from "../grid";
import { Input } from "../input";
import { ClassComponent } from "./classComponent";
import { Component } from "./component";
import { ComponentType } from "./componentType";

export class NoteComponent extends ClassComponent {
    private header: HTMLDivElement | undefined;

    constructor(xPos: number = 0, yPos: number = 0, width: number = 275, height: number = 200, id?: string) {
        super(xPos, yPos, width, height, id);

        this.classList.add("note-component");
        //this.classList.remove("class-component");

        this.cName.placeholder = "enter text";
        this.cName.isMultiline = true;

        this.connectedCallback();
    }

    connectedCallback() {
        this.innerHTML = "";

        if (!this.header) {
            this.header = document.createElement("div");
            this.header.classList.add("header");

            const line = document.createElement("div");
            this.header.append(line);

            this.updateCSSOnZoom();
        }

        this.append(this.header);
        this.append(this.cName);

        /*
        if (this.operationsList) {
            for (let index = 0; index < this.operationsList.length; index++) {
                this.addOperation(index);
            }
        }
        */
    }

    public getState() {
        let state = super.getState();
        state.type = ComponentType.NOTE;
        return state;
    }

    public updateCSSOnZoom() {
        if (this.header) this.header.style.top = `-${Grid.xZoom * Component.baseBorderWidth}px`;
        if (this.header) this.header.style.right = `-${Grid.xZoom * Component.baseBorderWidth}px`;
    }

    // Add functionality to the custom context menu
    protected createContextMenu(list: Element) {
        list.append(
            this.createContextBtn("Delete Component", "Del", () => {
                Input.removeComponents();
            })
        );
        list.append(this.createContextBtn("Copy Component", "Ctrl+C", () => {}));
        list.append(document.createElement("hr"));
        list.append(
            this.createContextBtn("Auto Resize", "", () => {
                this.autoResize();
            })
        );
    }
}

customElements.define("uml-together-note-component", NoteComponent);
