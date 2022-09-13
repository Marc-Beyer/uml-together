import { ScaleHandle, ScaleHandlePosition } from "./scaleHandle";

export class Component extends HTMLElement {
    private static _xOffset: number = 1;
    private static _yOffset: number = 1;
    private static _xZoom: number = 1;
    private static _yZoom: number = 1;
    public static zoomMax = 5;
    public static zoomMin = 0.5;
    public static componentList: Component[] = [];
    public static activeComponentList: Component[] = [];
    public static container: HTMLElement | null = document.getElementById("component-container");

    public static baseFontSize = 16;
    public static baseBorderWidth = 2;

    public static get xZoom(): number {
        return Component._xZoom;
    }
    public static set xZoom(value: number) {
        Component._xZoom = Math.max(Math.min(value, this.zoomMax), this.zoomMin);
    }
    public static get yZoom(): number {
        return Component._yZoom;
    }
    public static set yZoom(value: number) {
        Component._yZoom = Math.max(Math.min(value, this.zoomMax), this.zoomMin);
    }

    public static addOffset(x: number, y: number) {
        this._xOffset += x / -this._xZoom;
        this._yOffset += y / -this._yZoom;
        for (let index = 0; index < this.componentList.length; index++) {
            this.componentList[index].updateOffset();
        }
    }

    public static addZoom(x: number, y: number) {
        this._xZoom += x;
        this._yZoom += y;

        for (let index = 0; index < this.componentList.length; index++) {
            this.componentList[index].updateZoom();
        }
    }

    public static resetActiveComponents() {
        for (let index = 0; index < Component.activeComponentList.length; index++) {
            const element = Component.activeComponentList[index];
            element.isActive = false;
        }
        Component.activeComponentList = [];
    }

    public static addActiveComponents(component: Component, reset: boolean = true) {
        if (reset) this.resetActiveComponents();
        Component.activeComponentList.push(component);
        component.parentElement?.append(component);
        component.isActive = true;
    }

    private _xPos!: number;
    private _yPos!: number;
    private _width!: number;
    private _height!: number;
    private _isActive: boolean = false;

    /**
     * Getter and setter
     */
    public get xPos() {
        return this._xPos;
    }
    public set xPos(x: number) {
        this._xPos = x;
        const nPos = window.innerWidth / 2 + (this._xPos + Component._xOffset) * Component._xZoom;
        this.style.left = `${nPos}px`;
    }
    public get yPos(): number {
        return this._yPos;
    }
    public set yPos(y: number) {
        this._yPos = y;
        const nPos = window.innerHeight / 2 + (this._yPos + Component._yOffset) * Component._yZoom;
        this.style.top = `${nPos}px`;
    }
    public get width(): number {
        return this._width;
    }
    public set width(value: number) {
        this._width = value;
        this.style.width = value === -1 ? "auto" : `${this._width * Component._xZoom}px`;
    }
    public get height(): number {
        return this._height;
    }
    public set height(value: number) {
        this._height = value;
        this.style.height = value === -1 ? "auto" : `${this._height * Component._yZoom}px`;
    }
    public get isActive(): boolean {
        return this._isActive;
    }
    public set isActive(value: boolean) {
        if (value) {
            for (const key in ScaleHandlePosition) {
                if (Object.prototype.hasOwnProperty.call(ScaleHandlePosition, key)) {
                    this.addScaleHandle(key);
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

    /**
     * Methods
     */
    private addScaleHandle(scaleHandlePosition: String) {
        let scaleHandle = new ScaleHandle(scaleHandlePosition, this);
        this.append(scaleHandle);
    }

    public addPos(x: number, y: number) {
        this.xPos += x / -Component._xZoom;
        this.yPos += y / -Component._yZoom;
    }

    public updateOffset() {
        this.xPos = this.xPos;
        this.yPos = this.yPos;
    }

    public updateZoom() {
        this.width = this.width;
        this.height = this.height;
        this.updateOffset();
        this.style.fontSize = `${Component._xZoom * Component.baseFontSize}px`;
        this.style.borderWidth = `${Component._xZoom * Component.baseBorderWidth}px`;
        this.updateCSSOnZoom(Component._xZoom);
    }

    protected updateCSSOnZoom() {}

    constructor(xPos: number = 0, yPos: number = 0, width: number = -1, height: number = -1) {
        super();
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = width;
        this.height = height;

        this.updateZoom();
        this.updateOffset();

        this.className = "component";

        Component.componentList.push(this);
        Component.container?.append(this);

        this.addEventListener("mousedown", (event) => {
            if (event.button != 0) return;
            event.preventDefault();
            //event.stopPropagation();
            Component.addActiveComponents(this);
        });

        this.addEventListener("dblclick", () => {});
    }

    connectedCallback() {
        this.innerHTML = "Test Component";
    }
}

customElements.define("uml-together-component", Component);
