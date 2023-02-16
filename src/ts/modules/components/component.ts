import { Connection } from "../connections/connection";
import { Grid, GridPart } from "../grid";
import { Input, MovementMode } from "../input";
import { CreateMessage, MessageType } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
import { ComponentType } from "./componentType";
import { ScaleHandle, ScaleHandlePosition } from "./scaleHandle";

export class Component extends HTMLElement implements GridPart {
    public static activeComponentList: Component[] = [];
    public static container: HTMLElement | null = document.getElementById("component-container");

    public static baseFontSize = 16;
    public static baseBorderWidth = 2;
    public componentId: string = "";

    public static resetActiveComponents() {
        for (let index = 0; index < Component.activeComponentList.length; index++) {
            const element = Component.activeComponentList[index];
            element.isActive = false;
        }
        Input.movementMode = MovementMode.SCREEN;
        Component.activeComponentList = [];
    }

    public static addActiveComponents(component: Component, reset: boolean = true) {
        if (reset) this.resetActiveComponents();
        Input.movementMode = MovementMode.COMPONENT;
        Component.activeComponentList.push(component);
        component.parentElement?.append(component);
        component.isActive = true;
    }

    public connections: Connection[] = [];

    private _xPos!: number;
    private _yPos!: number;
    private _width!: number;
    private _height!: number;
    private _isActive: boolean = false;

    // Getter and setter

    public get xPos() {
        return this._xPos;
    }
    public set xPos(x: number) {
        this._xPos = x;
        let gridXPos = Grid.xRaster > 0 ? Math.round(this._xPos / Grid.xRaster) * Grid.xRaster : this._xPos;
        let nPos = window.innerWidth / 2 + (gridXPos + Grid.xOffset) * Grid.xZoom;
        this.style.left = `${nPos}px`;
        this.updateConnections();
    }
    public get yPos(): number {
        return this._yPos;
    }
    public set yPos(y: number) {
        this._yPos = y;
        let gridYPos = Grid.yRaster > 0 ? Math.round(this._yPos / Grid.yRaster) * Grid.yRaster : this._yPos;
        let nPos = window.innerHeight / 2 + (gridYPos + Grid.yOffset) * Grid.yZoom;
        this.style.top = `${nPos}px`;
        this.updateConnections();
    }
    public get width(): number {
        return this._width;
    }
    public set width(value: number) {
        this._width = Math.max(value, 0);
        let gridWidth = Grid.xRaster > 0 ? Math.round(this._width / Grid.xRaster) * Grid.yRaster : this._width;
        let width = gridWidth * Grid.xZoom;
        this.style.width = `${width}px`;
        this.updateConnections();
    }
    public get height(): number {
        return this._height;
    }
    public set height(value: number) {
        this._height = Math.max(value, 0);
        let gridHeight = Grid.yRaster > 0 ? Math.round(this._height / Grid.yRaster) * Grid.yRaster : this._height;
        let height = gridHeight * Grid.yZoom;
        this.style.height = `${height}px`;
        this.updateConnections();
    }
    public get isActive(): boolean {
        return this._isActive;
    }
    public set isActive(value: boolean) {
        if (value) {
            for (const key in ScaleHandlePosition) {
                if (Object.prototype.hasOwnProperty.call(ScaleHandlePosition, key) && parseInt(key) >= 0) {
                    this.addScaleHandle(parseInt(key));
                }
            }
            this.classList.add("is-active");
        } else {
            this.classList.remove("is-active");
            let collection = this.getElementsByClassName("scale-handle");
            while (collection.length > 0) {
                const element = collection[0];
                element.remove();
            }
        }
        this._isActive = value;
    }

    constructor(xPos: number = 0, yPos: number = 0, width: number = 200, height: number = 200, id: string) {
        super();
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = width;
        this.height = height;
        this.componentId = id;

        this.updateZoom();
        this.updateOffset();

        this.className = "component";

        Grid.gridParts.push(this);
        Component.container?.append(this);

        this.addEventListener("mousedown", (event) => {
            if (event.button != 0) return;
            event.preventDefault();
            //event.stopPropagation();
            Component.addActiveComponents(this);
        });

        this.addEventListener("click", (event) => {
            console.log("click on component");
        });
    }

    // Methods

    /**
     * Send a create message and return the id of the component
     * @param type the type of the created component
     * @returns the id of the component
     */
    public sendCreatedMessage(type: ComponentType): string {
        const data: CreateMessage = {
            type,
            id: this.createId(),
            x: this._xPos,
            y: this._yPos,
            width: this._width,
            height: this._height,
        };
        WebSocketController.instance.sent({
            type: MessageType.CREATE_COMPONENT,
            data,
        });
        return data.id;
    }

    public sendMoveMessage() {
        WebSocketController.instance.sent({
            type: MessageType.MOVE_COMPONENT,
            data: {
                id: this.componentId,
                x: this._xPos,
                y: this._yPos,
                width: this._width,
                height: this._height,
            },
        });
    }

    private createId(): string {
        this.componentId = self.crypto.randomUUID();
        return this.componentId;
    }

    private addScaleHandle(scaleHandlePosition: number) {
        let scaleHandle = new ScaleHandle(scaleHandlePosition, this);
        this.append(scaleHandle);
    }

    public addPos(x: number, y: number) {
        this.xPos += x / -Grid.xZoom;
        this.yPos += y / -Grid.yZoom;
    }

    public addSize(width: number, height: number) {
        this.width += width / -Grid.xZoom;
        this.height += height / -Grid.yZoom;
    }

    public updateOffset() {
        this.xPos = this.xPos;
        this.yPos = this.yPos;
    }

    public updateZoom() {
        this.width = this.width;
        this.height = this.height;
        this.updateOffset();
        this.style.fontSize = `${Grid.xZoom * Component.baseFontSize}px`;
        this.style.borderWidth = `${Grid.xZoom * Component.baseBorderWidth}px`;
        this.updateCSSOnZoom();
    }

    protected updateCSSOnZoom() {}

    connectedCallback() {
        this.innerHTML = "Test Component";
    }

    private updateConnections() {
        if (this.connections.length === 0) return;

        Grid.updateConnections();
    }
}

customElements.define("uml-together-component", Component);
