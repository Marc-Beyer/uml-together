import { Component } from "../components/component";
import { ComponentManager } from "../components/componentManager";
import { ComponentType } from "../components/componentType";
import { Global } from "../global";
import { Grid } from "../grid";
import { Input, MovementMode } from "../input";
import { Vector2 } from "../vector2";
import { CreateConnectionMessage } from "../webSocket/Message";
import { Connection } from "./connection";
import * as drawHelper from "./drawHelper";

export class ConnectionManager {
    public static instance: ConnectionManager;

    private connections: Map<string, Connection> = new Map();

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

            let connection = new Connection(this.selectedForConnection, component, this.connectionType);
            connection.sendCreatedMessage();
            this.addConnection(connection);

            this.stopConnecting();
        }
    }

    public stopConnecting() {
        this.selectedForConnection = null;
        Input.movementMode = MovementMode.SCREEN;
        Grid.updateConnections();
    }

    public selectedConnectionOnClick(x: number, y: number): boolean {
        for (const [_, connection] of this.connections) {
            let points = connection.getPoints();
            let distance = this.distanceToLine(this.translateX(x), this.translateY(y), points.x1, points.y1, points.x2, points.y2);

            if (distance < Global.CONNECTION_SELECT_TOLERANCE) {
                Connection.addActiveConnection(connection);
                Grid.updateConnections();
                return true;
            }
        }
        return false;
    }

    private distanceToLine(x: number, y: number, x1: number, y1: number, x2: number, y2: number): number {
        const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
        const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
        const projection = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / Math.pow(denominator, 2);
        if (projection < 0) {
            return Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
        } else if (projection > 1) {
            return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
        } else {
            return numerator / denominator;
        }
    }

    public onCreateMessage(message: CreateConnectionMessage) {
        console.log("onCreateMessage");

        if (this.connections.has(message.id)) return;

        let startComponent = ComponentManager.instance.getComponentFromId(message.startComponent);
        if (startComponent === undefined) return;

        let endComponent = ComponentManager.instance.getComponentFromId(message.endComponent);
        if (endComponent === undefined) return;

        console.log("onCreateMessage IS OK");

        this.connections.set(
            message.id,
            new Connection(
                startComponent,
                endComponent,
                message.type,
                new Vector2(message.startOffsetX, message.startOffsetY),
                new Vector2(message.endOffsetX, message.endOffsetY),
                message.id
            )
        );
    }

    public drawConnection(x: number, y: number) {
        if (this.selectedForConnection === null) return;

        Grid.updateConnections();

        let x1 = this.selectedForConnection.realXPos + this.selectedForConnection.realWidth / 2;
        let y1 = this.selectedForConnection.realYPos + this.selectedForConnection.realHeight / 2;
        let x2 = this.translateX(x);
        let y2 = this.translateY(y);

        Grid.ctx.fillStyle = Grid.lineColor;
        Grid.ctx.lineWidth = 2 * Grid.xZoom;

        Grid.ctx.beginPath();
        Grid.ctx.moveTo(x1, y1);
        Grid.ctx.lineTo(x2, y2);
        Grid.ctx.stroke();

        let angle = Connection.getAngle(x1, y1, x2, y2);
        drawHelper.drawConnectionHead(this.connectionType, x2, y2, angle);
    }

    public addConnection(connection: Connection) {
        if (this.connections.has(connection.connectionId)) return;

        console.log("Add connection", connection.connectionId);

        this.connections.set(connection.connectionId, connection);
    }

    public updateConnections() {
        for (const [_, connection] of this.connections) {
            connection.drawConnection();
        }
    }

    public delete(connection: Connection) {
        this.removeConnection(connection);
    }

    public removeConnection(connection: Connection) {
        this.connections.delete(connection.connectionId);
        Grid.updateConnections();
    }

    private translateX(value: number): number {
        return Grid.xRaster > 0 ? Math.round(value / Grid.xRaster) * Grid.xRaster : value;
    }

    private translateY(value: number): number {
        return Grid.yRaster > 0 ? Math.round(value / Grid.yRaster) * Grid.yRaster : value;
    }
}
