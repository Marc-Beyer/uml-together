import { Component, Line } from "../components/component";
import { ComponentType } from "../components/componentType";
import { Grid, GridPart } from "../grid";
import { Vector2 } from "../vector2";
import * as drawHelper from "./drawHelper";

export class Connection implements GridPart {
    private startComponent: Component;
    private endComponent: Component;
    private startOffset: Vector2;
    private endOffset: Vector2;
    private points: Vector2[] = [];
    private type: ComponentType;

    constructor(
        startComponent: Component,
        endComponent: Component,
        type: ComponentType,
        startOffset: Vector2 = new Vector2(0, 0),
        endOffset: Vector2 = new Vector2(0, 0)
    ) {
        this.endComponent = endComponent;
        this.startComponent = startComponent;
        this.endOffset = endOffset;
        this.startOffset = startOffset;

        this.type = type;

        this.startComponent.connections.push(this);
        this.endComponent.connections.push(this);
        Grid.connections.push(this);

        this.updateZoom();
    }

    public updateOffset(): void {
        this.drawConnection();
    }

    public updateZoom(): void {
        this.drawConnection();
    }

    public drawConnection() {
        Grid.ctx.fillStyle = "black";
        Grid.ctx.lineWidth = 2 * Grid.xZoom;

        let startX = this.startComponent.realXPos + this.startComponent.realWidth / 2;
        let startY = this.startComponent.realYPos + this.startComponent.realHeight / 2;

        let endX = this.endComponent.realXPos + this.endComponent.realWidth / 2;
        let endY = this.endComponent.realYPos + this.endComponent.realHeight / 2;

        let angle = Connection.getAngle(startX, startY, endX, endY);

        Grid.ctx.beginPath();

        Grid.ctx.moveTo(startX, startY);

        for (let index = 0; index < this.points.length; index++) {
            const point = this.points[index];
            Grid.ctx.lineTo(Connection.transformXPos(point.x), Connection.transformYPos(point.y));
        }

        Grid.ctx.lineTo(endX, endY);

        Grid.ctx.stroke();

        let intersection = this.getIntersectionPoint(new Vector2(startX, startY), new Vector2(endX, endY), this.endComponent.getCollider());
        if (intersection) {
            switch (this.type) {
                case ComponentType.GENERALIZATION:
                    drawHelper.drawRotatedTriangle(intersection.x, intersection.y, angle);
                    break;
                case ComponentType.ASSOCIATION:
                    drawHelper.drawRotatedTriangle(intersection.x, intersection.y, angle, true);
                    break;
                case ComponentType.AGGREGATION:
                    drawHelper.drawRotatedRectangle(intersection.x, intersection.y, angle);
                    break;
                case ComponentType.COMPOSITION:
                    drawHelper.drawRotatedRectangle(intersection.x, intersection.y, angle, true);
                    break;

                default:
                    break;
            }
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
}
