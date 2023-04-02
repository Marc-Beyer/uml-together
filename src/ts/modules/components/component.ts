import { Connection } from "../connections/connection";
import { ConnectionManager } from "../connections/connectionManager";
import { Grid, GridPart } from "../grid";
import { Input, MovementMode } from "../input";
import { CreateMessage, MessageType } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
import { ComponentType } from "./componentType";
import { ScaleHandle, ScaleHandlePosition } from "./scaleHandle";

export interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export class Component extends HTMLElement implements GridPart {
    public static activeComponentList: Set<Component> = new Set();
    public static container: HTMLElement | null = document.getElementById("component-container");

    public static baseFontSize = 16;
    public static baseBorderWidth = 2;
    public componentId: string = "";

    public static resetActiveComponents() {
        for (const component of Component.activeComponentList) {
            component.isActive = false;
        }
        if (Input.movementMode !== MovementMode.CONNECTION) {
            Input.movementMode = MovementMode.SCREEN;
        }
        Component.activeComponentList = new Set();
    }

    public static addActiveComponents(component: Component, activate: boolean = true, resetOthers: boolean = true) {
        if (activate) {
            if (resetOthers && !Component.activeComponentList.has(component)) this.resetActiveComponents();
            Component.activeComponentList.add(component);
            component.parentElement?.append(component);
            component.isActive = true;
        }
        if (Input.movementMode === MovementMode.CONNECTION) {
            console.log("connect", component);

            ConnectionManager.instance.connect(component);
        } else {
            Input.movementMode = MovementMode.COMPONENT;
        }
    }

    public connections: Connection[] = [];

    private _xPos!: number;
    private _yPos!: number;
    private _width!: number;
    private _height!: number;
    private _isActive: boolean = false;

    private _realXPos!: number;
    private _realYPos!: number;
    private _realWidth!: number;
    private _realHeight!: number;

    // Getter and setter

    public get realXPos() {
        return this._realXPos;
    }

    public get realYPos() {
        return this._realYPos;
    }

    public get realWidth() {
        return this._realWidth;
    }

    public get realHeight() {
        return this._realHeight;
    }

    public get xPos() {
        return this._xPos;
    }
    public set xPos(x: number) {
        this._xPos = x;
        let gridXPos = Grid.xRaster > 0 ? Math.round(this._xPos / Grid.xRaster) * Grid.xRaster : this._xPos;
        this._realXPos = window.innerWidth / 2 + (gridXPos + Grid.xOffset) * Grid.xZoom;
        this.style.left = `${this._realXPos}px`;
        this.updateConnections();
    }
    public get yPos(): number {
        return this._yPos;
    }
    public set yPos(y: number) {
        this._yPos = y;
        let gridYPos = Grid.yRaster > 0 ? Math.round(this._yPos / Grid.yRaster) * Grid.yRaster : this._yPos;
        this._realYPos = window.innerHeight / 2 + (gridYPos + Grid.yOffset) * Grid.yZoom;
        this.style.top = `${this._realYPos}px`;
        this.updateConnections();
    }
    public get width(): number {
        return this._width;
    }
    public set width(value: number) {
        this._width = Math.max(value, 0);
        let gridWidth = Grid.xRaster > 0 ? Math.round(this._width / Grid.xRaster) * Grid.yRaster : this._width;
        this._realWidth = gridWidth * Grid.xZoom;
        this.style.width = `${this._realWidth}px`;
        this.updateConnections();
    }
    public get height(): number {
        return this._height;
    }
    public set height(value: number) {
        this._height = Math.max(value, 0);
        let gridHeight = Grid.yRaster > 0 ? Math.round(this._height / Grid.yRaster) * Grid.yRaster : this._height;
        this._realHeight = gridHeight * Grid.yZoom;
        this.style.height = `${this._realHeight}px`;
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

    constructor(xPos: number = 0, yPos: number = 0, width: number = 200, height: number = 200, id?: string) {
        super();
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = width;
        this.height = height;
        this.componentId = id ?? this.createId();

        this.updateZoom();
        this.updateOffset();

        this.classList.add("component");

        Grid.gridParts.push(this);
        Component.container?.append(this);

        this.addEventListener("mousedown", (event) => {
            if (event.button != 0) return;
            event.preventDefault();
            //event.stopPropagation();

            Component.addActiveComponents(this, true, !event.ctrlKey);
        });

        this.addEventListener("contextmenu", (event) => {
            if (event.ctrlKey) return;

            const contextMenu = document.getElementById("context-menu");
            if (!contextMenu) return;
            event.preventDefault();
            const list = contextMenu.children[0];

            contextMenu.style.display = "block";
            contextMenu.style.left = `${event.pageX}px`;
            contextMenu.style.top = `${event.pageY}px`;
            list.innerHTML = "";
            this.createContextMenu(list);

            document.addEventListener(
                "click",
                () => {
                    contextMenu.style.display = "";
                },
                { once: true }
            );
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
            id: this.componentId,
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

    public sendDeleteMessage() {
        WebSocketController.instance.sent({
            type: MessageType.DELETE_COMPONENT,
            data: {
                id: this.componentId,
            },
        });
    }

    public getState() {
        return {
            id: this.componentId,
            x: this._xPos,
            y: this._yPos,
            width: this._width,
            height: this._height,
        };
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

    public edit(message: any) {
        for (const key in message) {
            if (Object.prototype.hasOwnProperty.call(message, key)) {
                (this as any)[key] = message[key];
            }
        }
    }

    public getCollider(): Line[] {
        return [
            {
                x1: this.realXPos,
                y1: this.realYPos,
                x2: this.realXPos + this.realWidth,
                y2: this.realYPos,
            },
            {
                x1: this.realXPos + this.realWidth,
                y1: this.realYPos,
                x2: this.realXPos + this.realWidth,
                y2: this.realYPos + this.realHeight,
            },
            {
                x1: this.realXPos + this.realWidth,
                y1: this.realYPos + this.realHeight,
                x2: this.realXPos,
                y2: this.realYPos + this.realHeight,
            },
            {
                x1: this.realXPos,
                y1: this.realYPos + this.realHeight,
                x2: this.realXPos,
                y2: this.realYPos,
            },
        ];
    }

    public onDelete() {
        for (let index = 0; index < this.connections.length; index++) {
            ConnectionManager.instance.delete(this.connections[index]);
        }
    }

    protected createContextMenu(list: Element) {
        list.append(
            this.createContextBtn("Delete Component", "DEL", () => {
                Input.removeComponents();
            })
        );
    }

    protected createContextBtn(text: string, shortcut: string = "", listener: () => any) {
        let li = document.createElement("li");
        let btn = document.createElement("button");
        let div1 = document.createElement("div");
        div1.append(document.createTextNode(text));
        let div2 = document.createElement("div");
        div2.append(document.createTextNode(shortcut));

        btn.addEventListener("click", listener);
        btn.append(div1);
        btn.append(div2);
        li.append(btn);
        return li;
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
