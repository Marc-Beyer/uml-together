import { Component } from "../components/component";
import { ComponentType } from "../components/componentType";
import { Grid, GridPart } from "../grid";
import { Vector2 } from "../vector2";

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

        let intersection = this.getIntersectionPoint(
            new Vector2(endX, endY),
            new Vector2(startX, startY),
            this.startComponent.realXPos,
            this.startComponent.realYPos,
            this.startComponent.realWidth,
            this.startComponent.realHeight
        );
        if (intersection) {
            console.log("ComponentType", ComponentType[this.type]);

            switch (this.type) {
                case ComponentType.GENERALIZATION:
                    Grid.ctx.strokeRect(intersection.x - 5, intersection.y - 5, 10, 10);
                    break;

                default:
                    break;
            }
        }

        Grid.ctx.beginPath();

        Grid.ctx.moveTo(startX, startY);

        for (let index = 0; index < this.points.length; index++) {
            const point = this.points[index];
            Grid.ctx.lineTo(this.transformXPos(point.x), this.transformYPos(point.y));
        }

        Grid.ctx.lineTo(endX, endY);

        Grid.ctx.stroke();
    }

    private getIntersectionPoint(startPoint: Vector2, endPoint: Vector2, boxX: number, boxY: number, boxWidth: number, boxHeight: number) {
        let topLeft = new Vector2(boxX, boxY);
        let topRight = new Vector2(boxX + boxWidth, boxY);
        let bottomLeft = new Vector2(boxX, boxY + boxHeight);
        let bottomRight = new Vector2(boxX + boxWidth, boxY + boxHeight);

        let point = this.getLineIntersection(startPoint, endPoint, topLeft, topRight);
        if (point !== null) return point;

        point = this.getLineIntersection(startPoint, endPoint, topLeft, bottomLeft);
        if (point !== null) return point;

        point = this.getLineIntersection(startPoint, endPoint, topRight, bottomRight);
        if (point !== null) return point;

        point = this.getLineIntersection(startPoint, endPoint, bottomRight, bottomLeft);
        if (point !== null) return point;

        return null;
    }

    private getLineIntersection(start1: Vector2, end1: Vector2, start2: Vector2, end2: Vector2) {
        const x1 = start1.x;
        const y1 = start1.y;
        const x2 = end1.x;
        const y2 = end1.y;
        const x3 = start2.x;
        const y3 = start2.y;
        const x4 = end2.x;
        const y4 = end2.y;

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
