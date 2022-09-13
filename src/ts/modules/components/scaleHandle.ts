import { Component } from "./component";

export enum ScaleHandlePosition {
    "TOP_LEFT",
    "TOP",
    "TOP_RIGHT",
    "RIGHT",
    "BOTTOM_RIGHT",
    "BOTTOM",
    "BOTTOM_LEFT",
    "LEFT",
}

export class ScaleHandle extends HTMLElement {
    constructor(scaleHandlePosition: ScaleHandlePosition, component: Component) {
        super();
        this.className = "scale-handle";

        this.addEventListener("mousedown", (event) => {
            if (event.button != 0) return;
            event.preventDefault();
            event.stopPropagation();
        });
    }

    connectedCallback() {
        this.innerHTML = "";
    }
}

customElements.define("uml-together-scale-handle", ScaleHandle);
