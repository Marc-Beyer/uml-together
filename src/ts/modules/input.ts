import { Component } from "./components/component";
import { ComponentManager } from "./components/componentManager";
import { ScaleHandle } from "./components/scaleHandle";
import { Connection } from "./connections/connection";
import { ConnectionManager } from "./connections/connectionManager";
import { Grid } from "./grid";

export enum MovementMode {
    SCREEN,
    COMPONENT,
    RESIZE,
    EDIT,
    CONNECTION,
    SELECTED_CONNECTION,
}

export function initInput() {
    new Input();
}

export class Input {
    public static isMousedown = false;
    public static zoomSensibility = -0.001;
    public static x: number = 0;
    public static y: number = 0;
    public static scaleHandle: ScaleHandle;
    public static clickedOnComponent: boolean = false;

    private static _movementMode: MovementMode = MovementMode.SCREEN;

    public static get movementMode() {
        return Input._movementMode;
    }

    public static set movementMode(mode: MovementMode) {
        Input._movementMode = mode;
    }

    constructor() {
        const container = document.getElementById("component-container");

        if (!container) {
            throw new Error("component-container not found!");
        }

        document.addEventListener("keyup", (event) => {
            if (event.keyCode === 46 || event.key === "Delete") {
                Input.removeComponents();
            }
        });

        container.addEventListener("wheel", (event) => {
            const zoom = Input.zoomSensibility * event.deltaY;

            Grid.addZoom(zoom, zoom);
        });

        container.addEventListener("dblclick", (event) => {
            Input.x = event.screenX;
            Input.y = event.screenY;
            if (!Input.clickedOnComponent && Input.movementMode !== MovementMode.CONNECTION) {
                ConnectionManager.instance.addNodeOnClick(event.pageX, event.pageY);
            }
        });

        container.addEventListener("mousedown", (event) => {
            if (event.button !== 0 && event.button !== 1) return;
            Input.x = event.screenX;
            Input.y = event.screenY;
            Input.isMousedown = true;

            if (!Input.clickedOnComponent) {
                if (Input.movementMode !== MovementMode.CONNECTION) {
                    if (ConnectionManager.instance.selectedConnectionOnClick(event.pageX, event.pageY)) {
                        Component.resetActiveComponents();
                        Input.movementMode = MovementMode.SELECTED_CONNECTION;
                    } else {
                        Connection.resetActiveConnections();
                        Component.resetActiveComponents();
                    }
                } else {
                    if (event.button === 1) {
                        ConnectionManager.instance.stopConnecting();
                    }
                    Connection.resetActiveConnections();
                    Component.resetActiveComponents();
                }
            } else {
                Input.clickedOnComponent = false;
                if (!event.ctrlKey) Connection.resetActiveConnections(false);
            }
        });

        container.addEventListener("mouseup", (event) => {
            if (event.button != 0 && event.button != 1) return;
            Input.isMousedown = false;

            switch (Input.movementMode) {
                case MovementMode.SCREEN:
                    break;
                case MovementMode.COMPONENT:
                case MovementMode.RESIZE:
                    for (const component of Component.activeComponentList) {
                        component.sendMoveMessage();
                    }
                    break;

                case MovementMode.SELECTED_CONNECTION:
                    ConnectionManager.instance.endMove();
                    break;

                default:
                    break;
            }
        });

        document.addEventListener("mousemove", (event) => {
            if (Input.isMousedown) {
                switch (Input.movementMode) {
                    case MovementMode.SCREEN:
                        Grid.addOffset(Input.x - event.screenX, Input.y - event.screenY);
                        Input.x = event.screenX;
                        Input.y = event.screenY;
                        break;
                    case MovementMode.COMPONENT:
                        const x = Input.x - event.screenX;
                        const y = Input.y - event.screenY;
                        for (const component of Component.activeComponentList) {
                            component.addPos(x, y);
                        }
                        Input.x = event.screenX;
                        Input.y = event.screenY;
                        break;
                    case MovementMode.SELECTED_CONNECTION:
                        ConnectionManager.instance.moveConnections(Input.x - event.screenX, Input.y - event.screenY);
                        Input.x = event.screenX;
                        Input.y = event.screenY;
                        break;
                    case MovementMode.RESIZE:
                        Input.scaleHandle.moveScaleHandle(event);
                        break;

                    case MovementMode.CONNECTION:
                        Grid.addOffset(Input.x - event.screenX, Input.y - event.screenY);
                        Input.x = event.screenX;
                        Input.y = event.screenY;

                        ConnectionManager.instance.drawConnection(event.screenX, event.screenY);
                        break;

                    default:
                        break;
                }
            } else {
                switch (Input.movementMode) {
                    case MovementMode.CONNECTION:
                        ConnectionManager.instance.drawConnection(event.pageX, event.pageY);
                        break;
                }
            }
        });
    }

    public static removeComponents() {
        for (const component of Component.activeComponentList) {
            ComponentManager.instance.removeComponent(component);
            component.sendDeleteMessage();
        }
    }
}
