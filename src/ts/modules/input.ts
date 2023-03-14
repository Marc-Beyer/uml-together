import { Component } from "./components/component";
import { ComponentManager } from "./components/componentManager";
import { ScaleHandle } from "./components/scaleHandle";
import { Grid } from "./grid";

export enum MovementMode {
    "SCREEN",
    "COMPONENT",
    "RESIZE",
    EDIT,
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
    public static scaleHandle: ScaleHandle;

    constructor() {
        const container = document.getElementById("component-container");

        if (!container) {
            throw new Error("component-container not found!");
        }

        document.addEventListener("keyup", (event) => {
            console.log(event.key, "up");

            if (event.keyCode === 46 || event.key === "Delete") {
                for (let index = 0; index < Component.activeComponentList.length; index++) {
                    const component: Component = Component.activeComponentList[index];
                    console.log(component, "rem");
                    ComponentManager.instance.removeComponent(component);
                    component.sendDeleteMessage();
                }
            }
        });

        container.addEventListener("wheel", (event) => {
            const zoom = Input.zoomSensibility * event.deltaY;

            Grid.addZoom(zoom, zoom);
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

            switch (Input.movementMode) {
                case MovementMode.SCREEN:
                    break;
                case MovementMode.COMPONENT:
                case MovementMode.RESIZE:
                    for (let index = 0; index < Component.activeComponentList.length; index++) {
                        Component.activeComponentList[index].sendMoveMessage();
                    }
                    break;

                default:
                    break;
            }
        });

        document.addEventListener("mousemove", (event) => {
            if (!Input.isMousedown) return;

            switch (Input.movementMode) {
                case MovementMode.SCREEN:
                    Grid.addOffset(Input.x - event.screenX, Input.y - event.screenY);
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
                    Input.scaleHandle.moveScaleHandle(event);
                    break;

                default:
                    break;
            }
        });
    }
}
