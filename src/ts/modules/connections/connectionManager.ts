import { Component } from "../components/component";
import { ComponentType } from "../components/componentType";
import { Grid } from "../grid";
import { Input, MovementMode } from "../input";
import { Connection } from "./connection";
import * as drawHelper from "./drawHelper";

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

        let x1 = this.selectedForConnection.realXPos + this.selectedForConnection.realWidth / 2;
        let y1 = this.selectedForConnection.realYPos + this.selectedForConnection.realHeight / 2;
        let x2 = this.translateX(x);
        let y2 = this.translateY(y);

        Grid.ctx.fillStyle = "black";
        Grid.ctx.lineWidth = 2 * Grid.xZoom;

        Grid.ctx.beginPath();
        Grid.ctx.moveTo(x1, y1);
        Grid.ctx.lineTo(x2, y2);
        Grid.ctx.stroke();

        let angle = Connection.getAngle(x1, y1, x2, y2);

        switch (this.connectionType) {
            case ComponentType.GENERALIZATION:
                drawHelper.drawRotatedTriangle(x2, y2, angle);
                break;
            case ComponentType.ASSOCIATION:
                drawHelper.drawRotatedTriangle(x2, y2, angle, true);
                break;
            case ComponentType.AGGREGATION:
                drawHelper.drawRotatedRectangle(x2, y2, angle);
                break;
            case ComponentType.COMPOSITION:
                drawHelper.drawRotatedRectangle(x2, y2, angle, true);
                break;

            default:
                break;
        }
    }

    private translateX(value: number): number {
        return Grid.xRaster > 0 ? Math.round(value / Grid.xRaster) * Grid.xRaster : value;
    }

    private translateY(value: number): number {
        return Grid.yRaster > 0 ? Math.round(value / Grid.yRaster) * Grid.yRaster : value;
    }
}
