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
                Input.onDelete();
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

        Input.addEventListener(container, ["mousedown", "touchstart"], (event) => {
            let button = 1;
            let pageX = 0;
            let pageY = 0;

            if (event instanceof MouseEvent) {
                button = event.button;

                if (button !== 0 && button !== 1) return;

                Input.x = event.screenX;
                Input.y = event.screenY;
                pageX = event.pageX;
                pageY = event.pageY;
            } else if (event instanceof TouchEvent) {
                Input.x = event.touches[0].screenX;
                Input.y = event.touches[0].screenY;
                pageX = event.touches[0].pageX;
                pageY = event.touches[0].pageY;
            } else {
                return;
            }

            Input.isMousedown = true;

            if (!Input.clickedOnComponent) {
                if (Input.movementMode !== MovementMode.CONNECTION) {
                    if (ConnectionManager.instance.selectedConnectionOnClick(pageX, pageY)) {
                        Component.resetActiveComponents();
                        Input.movementMode = MovementMode.SELECTED_CONNECTION;
                    } else {
                        Connection.resetActiveConnections();
                        Component.resetActiveComponents();
                    }
                } else {
                    if (button !== 1) {
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

        Input.addEventListener(container, ["mouseup", "touchend", "touchcancel"], (event) => {
            if (event instanceof MouseEvent && event.button != 0 && event.button != 1) return;
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

        Input.addEventListener(document, ["mousemove", "touchmove"], (event: Event) => {
            let screenX = 0;
            let screenY = 0;
            let pageX = 0;
            let pageY = 0;

            if (event instanceof MouseEvent) {
                screenX = event.screenX;
                screenY = event.screenY;
                pageX = event.pageX;
                pageY = event.pageY;
            } else if (event instanceof TouchEvent) {
                screenX = event.touches[0].screenX;
                screenY = event.touches[0].screenY;
                pageX = event.touches[0].pageX;
                pageY = event.touches[0].pageY;
            } else {
                return;
            }

            if (Input.isMousedown) {
                switch (Input.movementMode) {
                    case MovementMode.SCREEN:
                        Grid.addOffset(Input.x - screenX, Input.y - screenY);
                        Input.x = screenX;
                        Input.y = screenY;
                        break;
                    case MovementMode.COMPONENT:
                        const x = Input.x - screenX;
                        const y = Input.y - screenY;
                        for (const component of Component.activeComponentList) {
                            component.addPos(x, y);
                        }
                        Input.x = screenX;
                        Input.y = screenY;
                        break;
                    case MovementMode.SELECTED_CONNECTION:
                        ConnectionManager.instance.moveConnections(Input.x - screenX, Input.y - screenY);
                        Input.x = screenX;
                        Input.y = screenY;
                        break;
                    case MovementMode.RESIZE:
                        Input.scaleHandle.moveScaleHandle(screenX, screenY);
                        break;

                    case MovementMode.CONNECTION:
                        Grid.addOffset(Input.x - screenX, Input.y - screenY);
                        Input.x = screenX;
                        Input.y = screenY;

                        ConnectionManager.instance.drawConnection(screenX, screenY);
                        break;

                    default:
                        break;
                }
            } else {
                switch (Input.movementMode) {
                    case MovementMode.CONNECTION:
                        ConnectionManager.instance.drawConnection(pageX, pageY);
                        break;
                }
            }
        });
    }

    public static addEventListener(element: HTMLElement | Document, type: string[], listener: (event: Event) => void) {
        for (let index = 0; index < type.length; index++) {
            element.addEventListener(type[index], (event) => {
                listener(event);
            });
        }
    }

    public static onDelete() {
        for (const component of Component.activeComponentList) {
            ComponentManager.instance.removeComponent(component);
            component.sendDeleteMessage();
        }
        ConnectionManager.instance.onDelete();
    }
}
