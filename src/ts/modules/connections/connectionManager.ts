import { Component } from "../components/component";
import { ComponentType } from "../components/componentType";
import { Grid } from "../grid";
import { Input, MovementMode } from "../input";
import { Connection } from "./connection";

export class ConnectionManager {
    public static instance: ConnectionManager;

    private selectedForConnection: Component | null = null;
    public connectionType: ComponentType = ComponentType.USAGE;

    constructor() {
        ConnectionManager.instance = this;
    }

    public connect(component: Component) {
        if (this.selectedForConnection === null) {
            this.selectedForConnection = component;
        } else {
            if (this.selectedForConnection === component) return;

            new Connection(this.selectedForConnection, component, this.connectionType);
            this.selectedForConnection = null;
            Input.movementMode = MovementMode.SCREEN;
            Grid.updateConnections();
        }
    }

    public drawConnection(x: number, y: number) {
        if (this.selectedForConnection === null) return;

        Grid.updateConnections();
        console.log("draw");

        Grid.ctx.fillStyle = "black";
        Grid.ctx.lineWidth = 2 * Grid.xZoom;

        Grid.ctx.beginPath();
        Grid.ctx.moveTo(
            this.transformXPos(this.translateX(this.selectedForConnection.xPos) + this.selectedForConnection.width / 2),
            this.transformYPos(this.translateY(this.selectedForConnection.yPos) + this.selectedForConnection.height / 2)
        );
        Grid.ctx.lineTo(this.translateX(x), this.translateY(y));
        Grid.ctx.stroke();
    }

    private translateX(value: number): number {
        return Grid.xRaster > 0 ? Math.round(value / Grid.xRaster) * Grid.xRaster : value;
    }

    private translateY(value: number): number {
        return Grid.yRaster > 0 ? Math.round(value / Grid.yRaster) * Grid.yRaster : value;
    }

    private transformXPos(x: number): number {
        let nx = Grid.width / 2 + (x + Grid.xOffset) * Grid.xZoom;
        if (Grid.xRaster > 0) nx = Math.round(nx / Grid.xRaster) * Grid.xRaster;
        return nx;
    }
    private transformYPos(y: number): number {
        let ny = Grid.height / 2 + (y + Grid.yOffset) * Grid.yZoom;
        if (Grid.yRaster > 0) ny = Math.round(ny / Grid.xRaster) * Grid.xRaster;
        return ny;
    }
}
