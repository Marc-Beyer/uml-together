import { Input, MovementMode } from "../input";
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
    public handleSize: number = 12;

    constructor(scaleHandlePosition: number, component: Component) {
        super();
        this.className = "scale-handle";
        this.style.width = `${this.handleSize}px`;
        this.style.height = `${this.handleSize}px`;

        const handleOffset = this.handleSize / 2;

        this.setStyle(scaleHandlePosition, handleOffset);

        this.addEventListener("mousedown", (event) => {
            if (event.button != 0) return;
            event.preventDefault();
            event.stopPropagation();
            Input.x = event.screenX;
            Input.y = event.screenY;
            Input.isMousedown = true;
            Input.movementMode = MovementMode.RESIZE;
        });
    }

    private setStyle(scaleHandlePosition: number, handleOffset: number) {
        switch (scaleHandlePosition) {
            case ScaleHandlePosition.TOP_LEFT:
                this.style.top = `-${handleOffset}px`;
                this.style.left = `-${handleOffset}px`;
                this.style.cursor = "nw-resize";
                break;
            case ScaleHandlePosition.TOP:
                this.style.top = `-${handleOffset}px`;
                this.style.left = "0px";
                this.style.right = "0px";
                this.style.margin = "0 auto";
                this.style.cursor = "n-resize";
                break;
            case ScaleHandlePosition.TOP_RIGHT:
                this.style.top = `-${handleOffset}px`;
                this.style.right = `-${handleOffset}px`;
                this.style.cursor = "ne-resize";
                break;
            case ScaleHandlePosition.RIGHT:
                this.style.right = `-${handleOffset}px`;
                this.style.top = "0px";
                this.style.bottom = "0px";
                this.style.margin = "auto 0";
                this.style.cursor = "e-resize";
                break;
            case ScaleHandlePosition.BOTTOM_RIGHT:
                this.style.bottom = `-${handleOffset}px`;
                this.style.right = `-${handleOffset}px`;
                this.style.cursor = "se-resize";
                break;
            case ScaleHandlePosition.BOTTOM:
                this.style.bottom = `-${handleOffset}px`;
                this.style.left = "0px";
                this.style.right = "0px";
                this.style.margin = "0 auto";
                this.style.cursor = "s-resize";
                break;
            case ScaleHandlePosition.BOTTOM_LEFT:
                this.style.bottom = `-${handleOffset}px`;
                this.style.left = `-${handleOffset}px`;
                this.style.cursor = "sw-resize";
                break;
            case ScaleHandlePosition.LEFT:
                this.style.left = `-${handleOffset}px`;
                this.style.top = "0px";
                this.style.bottom = "0px";
                this.style.margin = "auto 0";
                this.style.cursor = "w-resize";
                break;

            default:
                this.style.display = "none";
                break;
        }
    }

    connectedCallback() {
        this.innerHTML = "";
    }
}

customElements.define("uml-together-scale-handle", ScaleHandle);
