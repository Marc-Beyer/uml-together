import { ConnectionManager } from "./connections/connectionManager";

export interface GridPart {
    updateOffset(): void;
    updateZoom(): void;
}

export class Grid {
    public static zoomMax = 5;
    public static zoomMin = 0.42;
    public static width: number = -1;
    public static height: number = -1;
    public static xRaster: number = 20;
    public static yRaster: number = 20;
    public static lineColor = "black";
    public static lineColorSelected = "red";
    public static backgroundColor = "white";
    public static zoomSizeCssRule: CSSStyleRule;

    public static gridParts: GridPart[] = [];

    private static _xOffset: number = 1;
    private static _yOffset: number = 1;
    private static _xZoom: number = 1;
    private static _yZoom: number = 1;
    private static _ctx: CanvasRenderingContext2D | null = null;

    // Getter and setter

    public static get xOffset(): number {
        return Grid._xOffset;
    }
    public static set xOffset(value: number) {
        Grid._xOffset = value;
    }
    public static get yOffset(): number {
        return Grid._yOffset;
    }
    public static set yOffset(value: number) {
        Grid._yOffset = value;
    }
    public static get xZoom(): number {
        return Grid._xZoom;
    }
    public static set xZoom(value: number) {
        Grid._xZoom = Math.max(Math.min(value, this.zoomMax), this.zoomMin);
        Grid.zoomSizeCssRule.style.setProperty("--zoom-size", `${Grid._xZoom}px`);
    }
    public static get yZoom(): number {
        return Grid._yZoom;
    }
    public static set yZoom(value: number) {
        Grid._yZoom = Math.max(Math.min(value, this.zoomMax), this.zoomMin);
    }
    public static get ctx(): CanvasRenderingContext2D {
        if (this._ctx === null) {
            const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
            this._ctx = canvas.getContext("2d");
            if (this._ctx === null) {
                throw new Error("Canvas is missing.");
            }

            this.width = canvas.offsetWidth;
            this.height = canvas.offsetHeight;
            this._ctx.canvas.width = this.width;
            this._ctx.canvas.height = this.height;
            window.addEventListener("resize", () => {
                this.width = canvas.offsetWidth;
                this.height = canvas.offsetHeight;
                if (this._ctx) {
                    this._ctx.canvas.width = this.width;
                    this._ctx.canvas.height = this.height;
                }
                Grid.updateAfterOffsetChange();
            });
        }
        return this._ctx;
    }

    // Methods

    public static addOffset(x: number, y: number) {
        this._xOffset += x / -this._xZoom;
        this._yOffset += y / -this._yZoom;

        Grid.updateAfterOffsetChange();
    }

    public static resetOffset() {
        this._xOffset = 1 / -this._xZoom;
        this._yOffset = 1 / -this._yZoom;

        Grid.updateAfterOffsetChange();
    }

    public static addZoom(x: number, y: number) {
        this.xZoom += x;
        this.yZoom += y;

        Grid.updateAfterZoomChange();
    }

    public static resetZoom() {
        this.xZoom = 1;
        this.yZoom = 1;

        Grid.updateAfterZoomChange();
    }

    public static updateConnections() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        ConnectionManager.instance.updateConnections();
    }

    private static updateAfterZoomChange() {
        for (let index = 0; index < this.gridParts.length; index++) {
            this.gridParts[index].updateZoom();
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        ConnectionManager.instance.updateConnections();
    }

    private static updateAfterOffsetChange() {
        for (let index = 0; index < this.gridParts.length; index++) {
            this.gridParts[index].updateOffset();
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        ConnectionManager.instance.updateConnections();
    }
}
