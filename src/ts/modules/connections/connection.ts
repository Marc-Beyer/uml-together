import { Component, Line } from "../components/component";
import { ComponentType } from "../components/componentType";
import { Grid, GridPart } from "../grid";
import { Input, MovementMode } from "../input";
import { Vector2 } from "../vector2";
import { MessageType } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
import * as drawHelper from "./drawHelper";

export class Connection implements GridPart {
    public static activeConnectionList: Connection[] = [];
    public connectionId: string = "";
    public isActive: boolean = false;

    private nodes: Vector2[] = [];
    private startComponent: Component;
    private endComponent: Component;
    private startOffset: Vector2;
    private endOffset: Vector2;
    private type: ComponentType;

    static resetActiveConnections(changeMoveMode: boolean = true) {
        for (let index = 0; index < Connection.activeConnectionList.length; index++) {
            const element = Connection.activeConnectionList[index];
            element.isActive = false;
        }
        if (changeMoveMode && Input.movementMode !== MovementMode.CONNECTION && Input.movementMode !== MovementMode.COMPONENT) {
            Input.movementMode = MovementMode.SCREEN;
        }
        Connection.activeConnectionList = [];

        Grid.updateConnections();
    }

    public static addActiveConnection(connection: Connection) {
        this.resetActiveConnections();
        Connection.activeConnectionList.push(connection);
        connection.isActive = true;
    }

    constructor(
        startComponent: Component,
        endComponent: Component,
        type: ComponentType,
        startOffset?: Vector2,
        endOffset?: Vector2,
        id?: string
    ) {
        this.endComponent = endComponent;
        this.startComponent = startComponent;
        if (endOffset === undefined) {
            this.endOffset = new Vector2(0, 0);
        } else {
            this.endOffset = endOffset;
        }
        if (startOffset === undefined) {
            this.startOffset = new Vector2(0, 0);
            //this.calcOffset();
        } else {
            this.startOffset = startOffset;
        }
        this.type = type;
        this.connectionId = id ?? this.createId();

        this.startComponent.connections.push(this);
        this.endComponent.connections.push(this);

        this.updateZoom();
    }

    public sendCreatedMessage() {
        WebSocketController.instance.sent({
            type: MessageType.CREATE_CONNECTION,
            data: {
                type: this.type,
                id: this.connectionId,
                startComponent: this.startComponent.componentId,
                endComponent: this.endComponent.componentId,
                startOffsetX: this.startOffset.x,
                startOffsetY: this.startOffset.y,
                endOffsetX: this.endOffset.x,
                endOffsetY: this.endOffset.y,
            },
        });
        return this.connectionId;
    }

    public sendEditMessage() {
        WebSocketController.instance.sent({
            type: MessageType.EDIT_CONNECTION,
            data: this.getState(),
        });
    }

    public sendDeleteMessage() {
        WebSocketController.instance.sent({
            type: MessageType.DELETE_CONNECTION,
            data: {
                id: this.connectionId,
            },
        });
    }

    public getState() {
        return {
            type: this.type,
            id: this.connectionId,
            startComponent: this.startComponent.componentId,
            endComponent: this.endComponent.componentId,
            startOffsetX: this.startOffset.x,
            startOffsetY: this.startOffset.y,
            endOffsetX: this.endOffset.x,
            endOffsetY: this.endOffset.y,
            nodes: this.nodes.map((node) => {
                return { x: node.x, y: node.y };
            }),
        };
    }

    public edit(message: any): void {
        this.type = message.type;

        this.startOffset.x = message.startOffsetX;
        this.startOffset.y = message.startOffsetY;
        this.endOffset.x = message.endOffsetX;
        this.endOffset.y = message.endOffsetY;

        this.nodes = [];
        for (let index = 0; index < message.nodes.length; index++) {
            const node = message.nodes[index];
            this.nodes.push(new Vector2(node.x, node.y));
        }

        Grid.updateConnections();
    }

    public updateOffset(): void {
        this.drawConnection();
    }

    public updateZoom(): void {
        this.drawConnection();
    }

    public drawConnection() {
        Grid.ctx.strokeStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;
        Grid.ctx.fillStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;

        Grid.ctx.lineWidth = 2 * Grid.xZoom;

        let startX = this.startComponent.realXPos + this.startComponent.realWidth / 2 + this.startOffset.x * Grid.yZoom;
        let startY = this.startComponent.realYPos + this.startComponent.realHeight / 2 + this.startOffset.y * Grid.yZoom;

        let endX = this.endComponent.realXPos + this.endComponent.realWidth / 2 + this.endOffset.x * Grid.xZoom;
        let endY = this.endComponent.realYPos + this.endComponent.realHeight / 2 + this.endOffset.y * Grid.yZoom;

        switch (this.type) {
            case ComponentType.USAGE:
                Grid.ctx.setLineDash([5, 5]);
                break;

            default:
                Grid.ctx.setLineDash([]);
                break;
        }

        Grid.ctx.beginPath();

        Grid.ctx.moveTo(startX, startY);

        for (let index = 0; index < this.nodes.length; index++) {
            const point = Connection.translateVector(this.nodes[index]);
            Grid.ctx.lineTo(point.x, point.y);
        }

        Grid.ctx.lineTo(endX, endY);

        Grid.ctx.stroke();

        if (this.isActive) {
            Grid.ctx.fillStyle = Grid.backgroundColor;
            for (let index = 0; index < this.nodes.length; index++) {
                const point = Connection.translateVector(this.nodes[index]);
                Grid.ctx.beginPath();
                Grid.ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                Grid.ctx.fill();
                Grid.ctx.stroke();
            }
        }

        let startPoint = new Vector2(startX, startY);
        if (this.nodes.length > 0) {
            startPoint = Connection.translateVector(this.nodes[this.nodes.length - 1]);
        }
        const intersection = this.getIntersectionPoint(startPoint, new Vector2(endX, endY), this.endComponent.getCollider());
        let angle = Connection.getAngle(startPoint.x, startPoint.y, endX, endY);
        if (intersection) drawHelper.drawConnectionHead(this.type, intersection.x, intersection.y, angle);
    }

    public getPoints() {
        const x1 = this.startComponent.realXPos + this.startComponent.realWidth / 2 + this.startOffset.x * Grid.yZoom;
        const y1 = this.startComponent.realYPos + this.startComponent.realHeight / 2 + this.startOffset.y * Grid.yZoom;
        const x2 = this.endComponent.realXPos + this.endComponent.realWidth / 2 + this.endOffset.x * Grid.yZoom;
        const y2 = this.endComponent.realYPos + this.endComponent.realHeight / 2 + this.endOffset.y * Grid.yZoom;
        return [
            new Vector2(x1, y1),
            ...this.nodes.map((node) => {
                return Connection.translateVector(node);
            }),
            new Vector2(x2, y2),
        ];
    }

    public addNode(x: number, y: number, position: number) {
        this.nodes.splice(position, 0, new Vector2(x, y));
        Grid.updateConnections();
        this.sendEditMessage();
    }

    public moveNode(x: number, y: number, position: number) {
        this.nodes[position].x += x;
        this.nodes[position].y += y;
    }

    public removeNode(position: number) {
        this.nodes.splice(position, 1);
        Grid.updateConnections();
        this.sendEditMessage();
    }

    public addSize(width: number, height: number, componentID: String) {
        if (this.endComponent.componentId === componentID) {
            this.endOffset.addNumber(-width, -height);
        } else {
            this.startOffset.addNumber(-width, -height);
        }
    }

    private getIntersectionPoint(startPoint: Vector2, endPoint: Vector2, collider: Line[]) {
        for (let index = 0; index < collider.length; index++) {
            let point = this.getLineIntersection(startPoint, endPoint, collider[index]);
            if (point !== null) return point;
        }
        return null;
    }

    private getLineIntersection(start1: Vector2, end1: Vector2, line: Line) {
        const x1 = start1.x;
        const y1 = start1.y;
        const x2 = end1.x;
        const y2 = end1.y;
        const x3 = line.x1;
        const y3 = line.y1;
        const x4 = line.x2;
        const y4 = line.y2;

        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denominator === 0) {
            return null;
        }

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return null;
        }

        const intersectionX = x1 + ua * (x2 - x1);
        const intersectionY = y1 + ua * (y2 - y1);

        return new Vector2(intersectionX, intersectionY);
    }

    public static getSlope(x1: number, y1: number, x2: number, y2: number) {
        return (y2 - y1) / (x2 - x1);
    }

    public static getAngle(x1: number, y1: number, x2: number, y2: number) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    public static transformXPos(x: number): number {
        let nx = Grid.width / 2 + (x + Grid.xOffset) * Grid.xZoom;
        if (Grid.xRaster > 0) nx = Math.round(nx / Grid.xRaster) * Grid.xRaster;
        return nx;
    }
    public static transformYPos(y: number): number {
        let ny = Grid.height / 2 + (y + Grid.yOffset) * Grid.yZoom;
        if (Grid.yRaster > 0) ny = Math.round(ny / Grid.xRaster) * Grid.xRaster;
        return ny;
    }

    public static translateVector(v: Vector2): Vector2 {
        return new Vector2(this.translateX(v.x), this.translateY(v.y));
    }

    public static translateY(y: number): number {
        let gridYPos = Grid.yRaster > 0 ? Math.round(y / Grid.yRaster) * Grid.yRaster : y;
        return Grid.height / 2 + (gridYPos + Grid.yOffset) * Grid.yZoom;
    }

    public static translateX(x: number): number {
        let gridXPos = Grid.xRaster > 0 ? Math.round(x / Grid.xRaster) * Grid.xRaster : x;
        return Grid.width / 2 + (gridXPos + Grid.xOffset) * Grid.xZoom;
    }

    private createId(): string {
        this.connectionId = self.crypto.randomUUID();
        return this.connectionId;
    }
}
