import { ConnectionAnnotation, ConnectionSide } from "../codegeneration/main";
import { Component, Line } from "../components/component";
import { ComponentType } from "../components/componentType";
import { Grid, GridPart } from "../grid";
import { Input, MovementMode } from "../input";
import { Vector2 } from "../vector2";
import { MessageType } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
import { ConnectionHead } from "./connectionHead";
import { ConnectionLine } from "./connectionLine";
import * as drawHelper from "./drawHelper";
import { fillInspector } from "./inspector";

export class Connection implements GridPart {
    public static activeConnectionList: Connection[] = [];
    public connectionId: string = "";
    public isActive: boolean = false;

    public startText: string = "";
    public middleText: string = "";
    public endText: string = "";

    public startHead: ConnectionHead = ConnectionHead.NONE;
    public endHead: ConnectionHead = ConnectionHead.NONE;
    public line: ConnectionLine = ConnectionLine.SOLID;

    public mainPadding: number = 25;
    public secondaryPadding: number = 5;

    private nodes: Vector2[] = [];
    private startComponent: Component;
    private endComponent: Component;
    private startOffset: Vector2;
    private endOffset: Vector2;

    static resetActiveConnections(changeMoveMode: boolean = true) {
        for (let index = 0; index < Connection.activeConnectionList.length; index++) {
            const element = Connection.activeConnectionList[index];
            element.isActive = false;
        }
        if (changeMoveMode && Input.movementMode !== MovementMode.CONNECTION && Input.movementMode !== MovementMode.COMPONENT) {
            Input.movementMode = MovementMode.SCREEN;
        }
        Connection.activeConnectionList = [];

        const inspector = document.getElementById("inspector-container");
        if (inspector) {
            inspector.classList.add("hidden");
        }

        Grid.updateConnections();
    }

    public static addActiveConnection(connection: Connection) {
        this.resetActiveConnections();
        Connection.activeConnectionList.push(connection);
        connection.isActive = true;

        fillInspector(connection);
    }

    constructor(
        startComponent: Component,
        endComponent: Component,
        startHead: ConnectionHead,
        endHead: ConnectionHead,
        line: ConnectionLine,
        startOffset: Vector2 = new Vector2(0, 0),
        endOffset: Vector2 = new Vector2(0, 0),
        id?: string
    ) {
        this.startOffset = startOffset;
        this.endOffset = endOffset;

        this.endComponent = endComponent;
        this.startComponent = startComponent;

        this.startHead = startHead;
        this.endHead = endHead;
        this.line = line;

        this.connectionId = id ?? this.createId();

        this.startComponent.connections.push(this);
        this.endComponent.connections.push(this);

        this.updateZoom();
    }

    public sendCreatedMessage() {
        WebSocketController.instance.sent({
            type: MessageType.CREATE_CONNECTION,
            data: {
                id: this.connectionId,
                startComponent: this.startComponent.componentId,
                endComponent: this.endComponent.componentId,
                startOffsetX: this.startOffset.x,
                startOffsetY: this.startOffset.y,
                endOffsetX: this.endOffset.x,
                endOffsetY: this.endOffset.y,
                startHead: this.startHead,
                endHead: this.endHead,
                line: this.line,
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
            id: this.connectionId,
            startComponent: this.startComponent.componentId,
            endComponent: this.endComponent.componentId,
            startOffsetX: this.startOffset.x,
            startOffsetY: this.startOffset.y,
            endOffsetX: this.endOffset.x,
            endOffsetY: this.endOffset.y,
            startText: this.startText,
            middleText: this.middleText,
            endText: this.endText,
            startHead: this.startHead,
            endHead: this.endHead,
            line: this.line,
            nodes: this.nodes.map((node) => {
                return { x: node.x, y: node.y };
            }),
        };
    }

    public edit(message: any): void {
        console.log(this);

        this.startOffset.x = message.startOffsetX;
        this.startOffset.y = message.startOffsetY;
        this.endOffset.x = message.endOffsetX;
        this.endOffset.y = message.endOffsetY;

        this.startText = message.startText;
        this.middleText = message.middleText;
        this.endText = message.endText;

        this.startHead = message.startHead;
        this.endHead = message.endHead;
        this.line = message.line;

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

        Grid.ctx.moveTo(startX, startY);

        for (let index = 0; index < this.nodes.length; index++) {
            const point = Connection.translateVector(this.nodes[index]);
            Grid.ctx.lineTo(point.x, point.y);
        }

        Grid.ctx.lineTo(endX, endY);

        Grid.ctx.stroke();

        Grid.ctx.setLineDash([]);

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
        let endPoint = new Vector2(endX, endY);
        if (this.nodes.length > 0) {
            endPoint = Connection.translateVector(this.nodes[0]);
        }
        const endIntersection = Connection.getIntersectionPoint(startPoint, new Vector2(endX, endY), this.endComponent.getCollider());
        const startIntersection = Connection.getIntersectionPoint(endPoint, new Vector2(startX, startY), this.startComponent.getCollider());

        let endAngle = Connection.getAngle(startPoint.x, startPoint.y, endX, endY);
        let startAngle = Connection.getAngle(endPoint.x, endPoint.y, startX, startY);

        Grid.ctx.font = 12 * Grid.xZoom + "px sans-serif";

        if (startIntersection) {
            Grid.ctx.strokeStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;
            Grid.ctx.fillStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;

            drawHelper.drawConnectionHead(this.startHead, startIntersection.x, startIntersection.y, startAngle, this.isActive);

            Grid.ctx.fillStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;
            Grid.ctx.strokeStyle = Grid.backgroundColor;

            const textOffset = this.getTextOffset(startIntersection, this.startComponent);
            Grid.ctx.strokeText(this.startText, startIntersection.x + textOffset.x, startIntersection.y + textOffset.y);
            Grid.ctx.fillText(this.startText, startIntersection.x + textOffset.x, startIntersection.y + textOffset.y);
        }

        if (endIntersection) {
            Grid.ctx.strokeStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;
            Grid.ctx.fillStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;

            drawHelper.drawConnectionHead(this.endHead, endIntersection.x, endIntersection.y, endAngle, this.isActive);

            Grid.ctx.fillStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;
            Grid.ctx.strokeStyle = Grid.backgroundColor;

            const textOffset = this.getTextOffset(endIntersection, this.endComponent);
            Grid.ctx.strokeText(this.endText, endIntersection.x + textOffset.x, endIntersection.y + textOffset.y);
            Grid.ctx.fillText(this.endText, endIntersection.x + textOffset.x, endIntersection.y + textOffset.y);
        }

        let middlePos = new Vector2((startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2);
        if (this.nodes.length > 0) {
            middlePos = endPoint;
        }
        Grid.ctx.fillStyle = this.isActive ? Grid.lineColorSelected : Grid.lineColor;
        Grid.ctx.strokeStyle = Grid.backgroundColor;
        Grid.ctx.textAlign = "center";
        Grid.ctx.textBaseline = "alphabetic";
        Grid.ctx.strokeText(this.middleText, middlePos.x, middlePos.y - this.secondaryPadding * Grid.xZoom);
        Grid.ctx.fillText(this.middleText, middlePos.x, middlePos.y - this.secondaryPadding * Grid.xZoom);
    }

    private getTextOffset(intersection: Vector2, component: Component) {
        const right = component.realXPos + component.realWidth;
        const left = component.realXPos;
        const top = component.realYPos;
        const bottom = component.realYPos + component.realHeight;

        let textOffset = new Vector2(0, 0);

        if (intersection.x.toFixed(3) === right.toFixed(3)) {
            Grid.ctx.textAlign = "left";
            Grid.ctx.textBaseline = "alphabetic";
            textOffset.x = this.mainPadding * Grid.xZoom;
            textOffset.y = -this.secondaryPadding * Grid.xZoom;
        } else if (intersection.x.toFixed(3) === left.toFixed(3)) {
            Grid.ctx.textAlign = "right";
            Grid.ctx.textBaseline = "alphabetic";
            textOffset.x = -this.mainPadding * Grid.xZoom;
            textOffset.y = -this.secondaryPadding * Grid.xZoom;
        }

        if (intersection.y.toFixed(3) === top.toFixed(3)) {
            Grid.ctx.textAlign = "center";
            Grid.ctx.textBaseline = "bottom";
            textOffset.y = -this.mainPadding * Grid.xZoom;
        } else if (intersection.y.toFixed(3) === bottom.toFixed(3)) {
            Grid.ctx.textAlign = "center";
            Grid.ctx.textBaseline = "top";
            textOffset.y = this.mainPadding * Grid.xZoom;
        }

        return textOffset;
    }

    public getNodes() {
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

    public static getIntersectionPoint(startPoint: Vector2, endPoint: Vector2, collider: Line[]) {
        for (let index = 0; index < collider.length; index++) {
            let point = this.getLineIntersection(startPoint, endPoint, collider[index]);
            if (point !== null) return point;
        }
        return null;
    }

    public static getLineIntersection(start1: Vector2, end1: Vector2, line: Line) {
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

    public getTypeAndDirection(): { type: ComponentType | undefined; isFlipped: boolean } {
        let isFlipped = false;
        let type = this.getType(this.startHead, this.endHead);

        if (type === undefined) {
            isFlipped = true;
            type = this.getType(this.endHead, this.startHead);
        }

        return { type, isFlipped };
    }

    private getType(startHead: ConnectionHead, endHead: ConnectionHead): ComponentType | undefined {
        if (this.line === ConnectionLine.SOLID) {
            if (startHead === ConnectionHead.NONE) {
                if (endHead === ConnectionHead.NONE) {
                    return ComponentType.ASSOCIATION;
                } else if (endHead === ConnectionHead.ARROW_STROKE) {
                    return ComponentType.GENERALIZATION;
                } else if (endHead === ConnectionHead.ARROW_FILLED) {
                    return ComponentType.DIRECTED_ASSOCIATION;
                }
            } else if (startHead === ConnectionHead.ROTATED_SQUARE_FILLED) {
                if (endHead === ConnectionHead.NONE) {
                    return ComponentType.AGGREGATION;
                }
            } else if (startHead === ConnectionHead.ROTATED_SQUARE_STROKE) {
                if (endHead === ConnectionHead.NONE) {
                    return ComponentType.COMPOSITION;
                }
            }
        } else {
            if (startHead === ConnectionHead.NONE) {
                if (endHead === ConnectionHead.ARROW_STROKE) {
                    return ComponentType.REALIZATION;
                } else if (endHead === ConnectionHead.NONE) {
                    return ComponentType.USAGE;
                } else if (endHead === ConnectionHead.ARROW_FILLED) {
                    return ComponentType.DEPENDENCY;
                }
            }
        }

        return undefined;
    }

    public getSide(component: Component, isFlipped: boolean): { side: ConnectionSide; other: Component; annotation: ConnectionAnnotation } {
        let side: ConnectionSide = ConnectionSide.NONE;
        let other: Component = component;
        let annotation: ConnectionAnnotation = ConnectionAnnotation.NONE;

        if (component === this.endComponent && component === this.startComponent) {
            side = ConnectionSide.BOTH;
            annotation = this.textToAnnotation(this.endText);
        } else if (component === this.endComponent) {
            side = isFlipped ? ConnectionSide.START : ConnectionSide.END;
            other = this.startComponent;
            annotation = this.textToAnnotation(this.startText);
        } else if (component === this.startComponent) {
            side = isFlipped ? ConnectionSide.END : ConnectionSide.START;
            other = this.endComponent;
            annotation = this.textToAnnotation(this.endText);
        }

        return { side, other, annotation };
    }

    private textToAnnotation(text: string): ConnectionAnnotation {
        const clearedText = text.replaceAll(/ /g, "").trim();
        if (/^[0-9\*]\.\.[0-9\*]$/.test(clearedText)) {
            return ConnectionAnnotation.MULTIPLE;
        }
        if (/^[2-9\*]$/.test(clearedText)) {
            return ConnectionAnnotation.MULTIPLE;
        }
        if (/^1$/.test(clearedText)) {
            return ConnectionAnnotation.SINGLE;
        }
        return ConnectionAnnotation.NONE;
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
