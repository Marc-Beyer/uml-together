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

        Grid.ctx.beginPath();
        Grid.ctx.moveTo(
            this.transformXPos(this.translateX(this.startComponent.xPos) + this.startComponent.width / 2),
            this.transformYPos(this.translateY(this.startComponent.yPos) + this.startComponent.height / 2)
        );
        for (let index = 0; index < this.points.length; index++) {
            const point = this.points[index];
            Grid.ctx.lineTo(this.transformXPos(point.x), this.transformYPos(point.y));
        }
        Grid.ctx.lineTo(
            this.transformXPos(this.translateX(this.endComponent.xPos) + this.endComponent.width / 2),
            this.transformYPos(this.translateY(this.endComponent.yPos) + this.endComponent.height / 2)
        );
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
