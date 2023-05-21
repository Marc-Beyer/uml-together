import { Component } from "../components/component";
import { ComponentManager } from "../components/componentManager";
import { Global } from "../settings/global";
import { Grid } from "../grid";
import { Input, MovementMode } from "../input";
import { Vector2 } from "../vector2";
import { CreateConnectionMessage, StateMessage } from "../webSocket/Message";
import { Connection } from "./connection";
import * as drawHelper from "./drawHelper";
import { ConnectionHead } from "./connectionHead";
import { ConnectionLine } from "./connectionLine";

export class ConnectionManager {
    public static instance: ConnectionManager;

    public startHead: ConnectionHead = ConnectionHead.NONE;
    public endHead: ConnectionHead = ConnectionHead.NONE;
    public line: ConnectionLine = ConnectionLine.SOLID;

    private connections: Map<string, Connection> = new Map();
    private selectedForConnection: Component | null = null;
    private selectedNode: { connection: Connection; position: number } | null = null;

    constructor() {
        ConnectionManager.instance = this;
    }

    public getState() {
        const connections = [];
        for (const [_, connection] of this.connections) {
            connections.push(connection.getState());
        }
        return connections;
    }

    public onStateMessage(message: StateMessage) {
        for (let index = 0; index < message.connections.length; index++) {
            const connection = message.connections[index];
            this.onCreateMessage(connection);
            this.onEditMessage(connection);
        }
    }

    public onDelete() {
        if (this.selectedNode !== null) {
            this.selectedNode.connection.removeNode(this.selectedNode.position);
            this.selectedNode = null;
        } else {
            for (let index = 0; index < Connection.activeConnectionList.length; index++) {
                const connection = Connection.activeConnectionList[index];
                connection.sendDeleteMessage();
                this.delete(connection);
            }
        }
    }

    public connect(component: Component) {
        if (this.selectedForConnection === null) {
            this.selectedForConnection = component;
        } else {
            if (this.selectedForConnection === component) return;

            let connection = new Connection(this.selectedForConnection, component, this.startHead, this.endHead, this.line);
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
            let info = this.distanceToConnection(this.translateX(x), this.translateY(y), connection);

            if (info.distance < Global.CONNECTION_SELECT_TOLERANCE) {
                let info2 = this.distanceToConnectionNode(this.translateX(x), this.translateY(y), connection);
                if (info2.distance < Global.CONNECTION_SELECT_TOLERANCE) {
                    this.selectedNode = { connection, position: info2.position - 1 };
                } else {
                    this.selectedNode = null;
                }

                Connection.addActiveConnection(connection);
                Grid.updateConnections();
                return true;
            }
        }
        return false;
    }

    public addNodeOnClick(x: number, y: number) {
        for (let index = 0; index < Connection.activeConnectionList.length; index++) {
            const connection = Connection.activeConnectionList[index];
            const info = this.distanceToConnection(this.translateX(x), this.translateY(y), connection);

            if (info.distance < Global.CONNECTION_SELECT_TOLERANCE) {
                let translatedX = (x - Grid.width / 2) / Grid.xZoom - Grid.xOffset;
                let translatedY = (y - Grid.height / 2) / Grid.yZoom - Grid.yOffset;
                connection.addNode(translatedX, translatedY, info.position);
            }
        }
    }

    // Move the selected connection
    public moveConnections(x: number, y: number) {
        this.selectedNode?.connection.moveNode(-x / Grid.xZoom, -y / Grid.yZoom, this.selectedNode?.position);
        Grid.updateConnections();
    }

    // Called on mouseup
    public endMove() {
        if (this.selectedNode !== null) {
            this.selectedNode.connection.sendEditMessage();
        }
    }

    private distanceToConnectionNode(x: number, y: number, connection: Connection): { distance: number; position: number } {
        let distance = Number.MAX_SAFE_INTEGER;
        let position = 0;

        const points = connection.getNodes();
        for (let i = 1; i < points.length - 1; i++) {
            const point = points[i];

            const curDistance = this.getDistanceToPoint(point, new Vector2(x, y));
            if (curDistance < distance) {
                distance = curDistance;
                position = i;
            }
        }
        return { distance, position };
    }

    private getDistanceToPoint(v1: Vector2, v2: Vector2): number {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Calculate the distance to a connection
    private distanceToConnection(x: number, y: number, connection: Connection): { distance: number; position: number } {
        let distance = Number.MAX_SAFE_INTEGER;
        let position = 0;

        const points = connection.getNodes();
        for (let i = 0; i < points.length - 1; i++) {
            const point1 = points[i];
            const point2 = points[i + 1];

            const curDistance = this.distanceToLine(this.translateX(x), this.translateY(y), point1.x, point1.y, point2.x, point2.y);
            if (curDistance < distance) {
                distance = curDistance;
                position = i;
            }
        }
        return { distance, position };
    }

    // Calculate the distance to a line
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
        if (this.connections.has(message.id)) return;

        let startComponent = ComponentManager.instance.getComponentFromId(message.startComponent);
        if (startComponent === undefined) return;

        let endComponent = ComponentManager.instance.getComponentFromId(message.endComponent);
        if (endComponent === undefined) return;

        this.connections.set(
            message.id,
            new Connection(
                startComponent,
                endComponent,
                message.startHead,
                message.endHead,
                message.line,
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
        Grid.ctx.strokeStyle = Grid.lineColor;
        Grid.ctx.lineWidth = 2 * Grid.xZoom;

        switch (this.line) {
            case ConnectionLine.DASHED:
                Grid.ctx.setLineDash([5, 5]);
                break;
            case ConnectionLine.DOTTED:
                Grid.ctx.setLineDash([2, 2]);
                break;

            default:
                Grid.ctx.setLineDash([]);
                break;
        }

        Grid.ctx.beginPath();
        Grid.ctx.moveTo(x1, y1);
        Grid.ctx.lineTo(x2, y2);
        Grid.ctx.stroke();

        Grid.ctx.setLineDash([]);

        const startIntersection = Connection.getIntersectionPoint(
            new Vector2(
                this.selectedForConnection.realXPos + this.selectedForConnection.realWidth / 2,
                this.selectedForConnection.realYPos + this.selectedForConnection.realHeight / 2
            ),
            new Vector2(x2, y2),
            this.selectedForConnection.getCollider()
        );

        let endAngle = Connection.getAngle(x1, y1, x2, y2);
        let startAngle = Connection.getAngle(x2, y2, x1, y1);

        if (startIntersection) {
            drawHelper.drawConnectionHead(this.startHead, startIntersection.x, startIntersection.y, startAngle);
        }
        drawHelper.drawConnectionHead(this.endHead, x2, y2, endAngle);
    }

    public addConnection(connection: Connection) {
        if (this.connections.has(connection.connectionId)) return;

        console.log("Add connection", connection.connectionId);

        this.connections.set(connection.connectionId, connection);
    }

    public onEditMessage(message: any) {
        const connection = this.connections.get(message.id);
        if (connection === undefined) return;

        connection.edit(message);
    }

    public onDeleteMessage(message: any) {
        const connection = this.connections.get(message.id);
        if (connection === undefined) return;

        this.delete(connection);
        Grid.updateConnections();
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
