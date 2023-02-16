import { Component } from "../components/component";
import { Grid, GridPart } from "../grid";
import { Vector2 } from "../vector2";

export class Connection implements GridPart {
    private startComponent: Component;
    private endComponent: Component;
    private startOffset: Vector2;
    private endOffset: Vector2;
    private points: Vector2[] = [];

    constructor(startComponent: Component, endComponent: Component, startOffset: Vector2, endOffset: Vector2) {
        this.endComponent = endComponent;
        this.startComponent = startComponent;
        this.endOffset = endOffset;
        this.startOffset = startOffset;

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

        Grid.ctx.beginPath();
        Grid.ctx.moveTo(
            this.transformXPos(this.startComponent.xPos + this.startOffset.x),
            this.transformYPos(this.startComponent.yPos + this.startOffset.y)
        );
        for (let index = 0; index < this.points.length; index++) {
            const point = this.points[index];
            Grid.ctx.lineTo(this.transformXPos(point.x), this.transformYPos(point.y));
        }
        Grid.ctx.lineTo(
            this.transformXPos(this.endComponent.xPos + this.endOffset.x),
            this.transformYPos(this.endComponent.yPos + this.endOffset.y)
        );
        Grid.ctx.stroke();
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
