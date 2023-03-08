import { CreateMessage, EditMessage, MoveMessage } from "../webSocket/Message";
import { ClassComponent } from "./classComponent";
import { Component } from "./component";
import { ComponentType } from "./componentType";

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
                this.components.set(
                    message.id,
                    new ClassComponent(message.x, message.y, message.width, message.height, message.id)
                );
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

    public addComponent(component: Component) {
        if (this.components.has(component.componentId)) return;

        console.log("Add comp", component.componentId);

        this.components.set(component.componentId, component);
    }
}
