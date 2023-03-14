import {
    CreateMessage,
    DeleteMessage,
    EditMessage,
    MessageType,
    MoveMessage,
    StateMessage,
} from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
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
        console.log("ne COmp", message);

        if (this.components.has(message.id)) return;
        console.log("ne COmp", message);

        switch (message.type) {
            case ComponentType.CLASS:
            case ComponentType.INTERFACE:
            case ComponentType.ENUM:
            case ComponentType.PRIMITIVE:
            case ComponentType.DATA_TYPE:
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

    public onDeleteMessage(message: DeleteMessage) {
        const component = this.components.get(message.id);
        if (component === undefined) return;

        this.removeComponent(component);
    }

    public onRequestStateMessage() {
        const components = [];
        for (const [_, component] of this.components) {
            components.push(component.getState());
        }

        WebSocketController.instance.sent({
            type: MessageType.STATE,
            data: {
                components,
            },
        });
    }

    public onStateMessage(message: StateMessage) {
        for (let index = 0; index < message.components.length; index++) {
            console.log("dddddddddddddddW");

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

        this.components.delete(component.componentId);
        component.remove();
    }
}
