import { Component } from "./components/component";

export enum MovementMode {
    "SCREEN",
    "COMPONENT",
    "RESIZE",
}

export function initInput() {
    new Input();
}

export class Input {
    public static isMousedown = false;
    public static movementMode: MovementMode = MovementMode.SCREEN;
    public static zoomSensibility = -0.001;
    public static x: number = 0;
    public static y: number = 0;

    constructor() {
        const container = document.getElementById("component-container");

        if (!container) {
            throw new Error("component-container not found!");
        }

        container.addEventListener("wheel", (event) => {
            const zoom = Input.zoomSensibility * event.deltaY;

            Component.addZoom(zoom, zoom);
        });

        container.addEventListener("mousedown", (event) => {
            if (event.button != 0 && event.button != 1) return;
            Input.x = event.screenX;
            Input.y = event.screenY;
            Input.isMousedown = true;

            if (!event.defaultPrevented) Component.resetActiveComponents();
        });

        container.addEventListener("mouseup", (event) => {
            if (event.button != 0 && event.button != 1) return;
            Input.isMousedown = false;
        });

        document.addEventListener("mousemove", (event) => {
            if (!Input.isMousedown) return;

            switch (Input.movementMode) {
                case MovementMode.SCREEN:
                    Component.addOffset(Input.x - event.screenX, Input.y - event.screenY);
                    Input.x = event.screenX;
                    Input.y = event.screenY;
                    break;
                case MovementMode.COMPONENT:
                    for (let index = 0; index < Component.activeComponentList.length; index++) {
                        const component = Component.activeComponentList[index];
                        component.addPos(Input.x - event.screenX, Input.y - event.screenY);
                        Input.x = event.screenX;
                        Input.y = event.screenY;
                    }
                    break;
                case MovementMode.RESIZE:
                    for (let index = 0; index < Component.activeComponentList.length; index++) {
                        const component = Component.activeComponentList[index];
                        component.addSize(Input.x - event.screenX, Input.y - event.screenY);
                        Input.x = event.screenX;
                        Input.y = event.screenY;
                    }
                    break;

                default:
                    break;
            }
        });
    }
}
