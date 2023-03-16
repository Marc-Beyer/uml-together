import { Grid } from "../grid";
import { ClassComponent } from "./classComponent";
import { Component } from "./component";
import { ComponentType } from "./componentType";

export class NoteComponent extends ClassComponent {
    private header: HTMLDivElement | undefined;

    constructor(xPos: number = 0, yPos: number = 0, width: number = 275, height: number = 200, id?: string) {
        super(xPos, yPos, width, height, id);

        this.classList.add("note-component");

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

        if (this.operationsList) {
            for (let index = 0; index < this.operationsList.length; index++) {
                this.addOperation(index);
            }
        }
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
}

customElements.define("uml-together-note-component", NoteComponent);
