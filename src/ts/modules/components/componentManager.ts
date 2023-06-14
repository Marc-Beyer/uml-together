import { getCodeFromClassComponent } from "../codegeneration/main";
import { CreateMessage, DeleteMessage, EditMessage, MoveMessage, StateMessage } from "../webSocket/Message";
import { ClassComponent } from "./classComponent";
import { Component } from "./component";
import { ComponentType } from "./componentType";
import { NoteComponent } from "./noteComponent";

export class ComponentManager {
    public static instance: ComponentManager;

    private components: Map<string, Component> = new Map();

    constructor() {
        ComponentManager.instance = this;
    }

    public onCreateMessage(message: CreateMessage) {
        if (this.components.has(message.id)) return;

        switch (message.type) {
            case ComponentType.CLASS:
            case ComponentType.INTERFACE:
            case ComponentType.ENUM:
            case ComponentType.PRIMITIVE:
            case ComponentType.DATA_TYPE:
                this.components.set(message.id, new ClassComponent(message.x, message.y, message.width, message.height, message.id));
                break;

            case ComponentType.NOTE:
                this.components.set(message.id, new NoteComponent(message.x, message.y, message.width, message.height, message.id));
                break;

            default:
                break;
        }
    }

    public onEditMessage(message: EditMessage) {
        const component = this.components.get(message.id);
        console.log("Edit", component);
        if (component === undefined) return;

        component.edit(message);
    }

    public onMoveMessage(message: MoveMessage) {
        const component = this.components.get(message.id);
        if (component === undefined) return;

        component.xPos = message.x;
        component.yPos = message.y;
        component.height = message.height;
        component.width = message.width;
    }

    public onDeleteMessage(message: DeleteMessage) {
        const component = this.components.get(message.id);
        if (component === undefined) return;

        this.removeComponent(component);
    }

    public getState(): CreateMessage[] {
        const components: CreateMessage[] = [];
        for (const [_, component] of this.components) {
            components.push(component.getState());
        }
        return components;
    }

    public onStateMessage(message: StateMessage) {
        for (let index = 0; index < message.components.length; index++) {
            const component = message.components[index];
            this.onCreateMessage(component);
            this.onEditMessage(component);
        }
    }

    public addComponent(component: Component) {
        if (this.components.has(component.componentId)) return;

        console.log("Add component", component.componentId);

        this.components.set(component.componentId, component);
    }

    public removeComponent(component: Component) {
        console.log("Remove component", component.componentId);

        component.onDelete();
        this.components.delete(component.componentId);
        component.remove();
    }

    public getComponentFromId(id: string): Component | undefined {
        return this.components.get(id);
    }

    public autoResizeAll() {
        for (const [_, component] of this.components) {
            component.autoResize();
        }
    }

    public getCode() {
        let codes: { code: string; name: string }[] = [];
        for (const [_, component] of this.components) {
            if (component instanceof ClassComponent) {
                const code = getCodeFromClassComponent(component);
                if (code !== null) codes.push(code);
            }
        }
        return codes;
    }

    public getDiagramSize() {
        let top: number | undefined = undefined;
        let left: number | undefined = undefined;
        let right: number | undefined = undefined;
        let bottom: number | undefined = undefined;

        for (const [_, component] of this.components) {
            if (component instanceof ClassComponent) {
                if (top === undefined || top > component.yPos) top = component.yPos;
                if (left === undefined || left > component.xPos) left = component.xPos;
                if (right === undefined || right < component.xPos + component.width) right = component.xPos + component.width;
                if (bottom === undefined || bottom < component.yPos + component.height) bottom = component.yPos + component.height;
            }
        }

        return {
            top,
            left,
            right,
            bottom,
        };
    }
}
