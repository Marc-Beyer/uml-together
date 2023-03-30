import { Grid } from "../grid";

export function drawRotatedTriangle(x: number, y: number, angle: number, filled: boolean = false) {
    angle += (Math.PI / 4) * 3;
    const x1 = x;
    const y1 = y;
    const x2 = x + 5 * Grid.xZoom;
    const y2 = y + 20 * Grid.xZoom;
    const x3 = x + 20 * Grid.xZoom;
    const y3 = y + 5 * Grid.xZoom;

    // Calculate the center of the triangle
    const centerX = x1;
    const centerY = y1;

    // Calculate the rotated points of the triangle
    const rotatedX1 = Math.cos(angle) * (x1 - centerX) - Math.sin(angle) * (y1 - centerY) + centerX;
    const rotatedY1 = Math.sin(angle) * (x1 - centerX) + Math.cos(angle) * (y1 - centerY) + centerY;
    const rotatedX2 = Math.cos(angle) * (x2 - centerX) - Math.sin(angle) * (y2 - centerY) + centerX;
    const rotatedY2 = Math.sin(angle) * (x2 - centerX) + Math.cos(angle) * (y2 - centerY) + centerY;
    const rotatedX3 = Math.cos(angle) * (x3 - centerX) - Math.sin(angle) * (y3 - centerY) + centerX;
    const rotatedY3 = Math.sin(angle) * (x3 - centerX) + Math.cos(angle) * (y3 - centerY) + centerY;

    // Begin the path
    Grid.ctx.beginPath();

    // Move to the first point
    Grid.ctx.moveTo(rotatedX1, rotatedY1);

    // Draw lines to the other two points
    Grid.ctx.lineTo(rotatedX2, rotatedY2);
    Grid.ctx.lineTo(rotatedX3, rotatedY3);

    // Close the path
    Grid.ctx.closePath();

    // Fill the triangle
    Grid.ctx.fillStyle = filled ? Grid.lineColor : Grid.backgroundColor;
    Grid.ctx.fill();
    Grid.ctx.stroke();
}

export function drawRotatedRectangle(x: number, y: number, angle: number, filled: boolean = false) {
    angle += (Math.PI / 4) * 3;
    const x1 = x;
    const y1 = y;
    const x2 = x;
    const y2 = y + 20 * Grid.xZoom;
    const x3 = x + 20 * Grid.xZoom;
    const y3 = y + 20 * Grid.xZoom;
    const x4 = x + 20 * Grid.xZoom;
    const y4 = y;

    // Calculate the center of the triangle
    const centerX = x1;
    const centerY = y1;

    // Calculate the rotated points of the triangle
    const rotatedX1 = Math.cos(angle) * (x1 - centerX) - Math.sin(angle) * (y1 - centerY) + centerX;
    const rotatedY1 = Math.sin(angle) * (x1 - centerX) + Math.cos(angle) * (y1 - centerY) + centerY;
    const rotatedX2 = Math.cos(angle) * (x2 - centerX) - Math.sin(angle) * (y2 - centerY) + centerX;
    const rotatedY2 = Math.sin(angle) * (x2 - centerX) + Math.cos(angle) * (y2 - centerY) + centerY;
    const rotatedX3 = Math.cos(angle) * (x3 - centerX) - Math.sin(angle) * (y3 - centerY) + centerX;
    const rotatedY3 = Math.sin(angle) * (x3 - centerX) + Math.cos(angle) * (y3 - centerY) + centerY;
    const rotatedX4 = Math.cos(angle) * (x4 - centerX) - Math.sin(angle) * (y4 - centerY) + centerX;
    const rotatedY4 = Math.sin(angle) * (x4 - centerX) + Math.cos(angle) * (y4 - centerY) + centerY;

    // Begin the path
    Grid.ctx.beginPath();

    // Move to the first point
    Grid.ctx.moveTo(rotatedX1, rotatedY1);

    // Draw lines to the other two points
    Grid.ctx.lineTo(rotatedX2, rotatedY2);
    Grid.ctx.lineTo(rotatedX3, rotatedY3);
    Grid.ctx.lineTo(rotatedX4, rotatedY4);

    // Close the path
    Grid.ctx.closePath();

    // Fill the triangle
    Grid.ctx.fillStyle = filled ? Grid.lineColor : Grid.backgroundColor;
    Grid.ctx.fill();
    Grid.ctx.stroke();
}
