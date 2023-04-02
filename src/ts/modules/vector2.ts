export class Vector2 {
    private _x: number;
    private _y: number;

    public get x(): number {
        return this._x;
    }
    public set x(value: number) {
        this._x = value;
    }
    public get y(): number {
        return this._y;
    }
    public set y(value: number) {
        this._y = value;
    }

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public add(vec: Vector2) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }

    public addNumber(x: number, y: number) {
        this.x += x;
        this.y += y;
        return this;
    }

    public sub(vec: Vector2) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }
}
