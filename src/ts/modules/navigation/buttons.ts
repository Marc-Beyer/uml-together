import { ClassComponent } from "../components/classComponent";
import { Diagram, DiagramButton } from "./main";
import { ComponentType } from "../components/componentType";
import { ComponentManager } from "../components/componentManager";
import { NoteComponent } from "../components/noteComponent";
import { Input, MovementMode } from "../input";
import { Component } from "../components/component";
import { ConnectionManager } from "../connections/connectionManager";
import { ConnectionHead } from "../connections/connectionHead";
import { ConnectionLine } from "../connections/connectionLine";

const navList = document.getElementById("nav-btn-list");

export function createButtons(diagram: Diagram) {
    let liElements: HTMLLIElement[] = [];
    for (const button of diagram.buttons) {
        let li = document.createElement("li");
        li.appendChild(createButton(button));

        liElements.push(li);
    }

    for (const li of liElements) {
        navList?.appendChild(li);
    }
}

function createButton(diagramButton: DiagramButton): HTMLButtonElement {
    let button: HTMLButtonElement = document.createElement("button");

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("img-container");

    const img = document.createElement("img");
    img.src = diagramButton.icon ?? "img/default-icon.svg";
    img.alt = diagramButton.text;

    imgContainer.append(img);
    button.append(imgContainer);

    const textContainer = document.createElement("div");
    textContainer.classList.add("text-container");
    textContainer.append(document.createTextNode(diagramButton.text));
    button.append(textContainer);
    button.classList.add("nav-button");

    switch (diagramButton.type) {
        case ComponentType.CLASS:
            button.addEventListener("click", () => {
                const component = new ClassComponent();
                component.sendCreatedMessage(diagramButton.type);
                ComponentManager.instance.addComponent(component);

                component.cType.text = "";
                component.cName.text = "Class";

                component.addAttribute("+attribute1: String");
                component.addAttribute("-attribute2: int = 42");

                component.addOperation("+operation1(param: String)");
                component.addOperation("-operation2(param: String): String");

                //component.width = 200;
                component.height = 150;

                component.connectedCallback();
                component.sendEditMessage();
                component.sendMoveMessage();
            });
            break;

        case ComponentType.INTERFACE:
            button.addEventListener("click", () => {
                const component = new ClassComponent();
                component.sendCreatedMessage(diagramButton.type);
                ComponentManager.instance.addComponent(component);

                component.cType.text = "<<interface>>";
                component.cName.text = "Interface";

                component.addAttribute("+attribute1: String");
                component.addAttribute("-attribute2: int = 42");

                component.addOperation("+operation1(param: String)");
                component.addOperation("-operation2(param: String): String");

                //component.width = 200;
                component.height = 200;

                component.connectedCallback();
                component.sendEditMessage();
                component.sendMoveMessage();
            });
            break;

        case ComponentType.ENUM:
            button.addEventListener("click", () => {
                const component = new ClassComponent();
                component.sendCreatedMessage(diagramButton.type);
                ComponentManager.instance.addComponent(component);

                component.cType.text = "<<enumeration>>";
                component.cName.text = "Enum";

                component.addAttribute("LITERAL_1");
                component.addAttribute("LITERAL_2");

                component.width = 200;
                component.height = 125;

                component.connectedCallback();
                component.sendEditMessage();
                component.sendMoveMessage();
            });
            break;

        case ComponentType.PRIMITIVE:
            button.addEventListener("click", () => {
                const component = new ClassComponent();
                component.sendCreatedMessage(diagramButton.type);
                ComponentManager.instance.addComponent(component);

                component.cType.text = "<<primitive>>";
                component.cName.text = "Primitive";

                component.width = 200;
                component.height = 100;

                component.connectedCallback();
                component.sendEditMessage();
                component.sendMoveMessage();
            });
            break;

        case ComponentType.DATA_TYPE:
            button.addEventListener("click", () => {
                const component = new ClassComponent();
                component.sendCreatedMessage(diagramButton.type);
                ComponentManager.instance.addComponent(component);

                component.cType.text = "<<dataType>>";
                component.cName.text = "DataType";

                component.width = 200;
                component.height = 100;

                component.connectedCallback();
                component.sendEditMessage();
                component.sendMoveMessage();
            });
            break;

        case ComponentType.NOTE:
            button.addEventListener("click", () => {
                const component = new NoteComponent();
                component.sendCreatedMessage(diagramButton.type);
                ComponentManager.instance.addComponent(component);

                component.cType.text = "";
                component.cName.text = "";
                component.addOperation("Note");

                component.width = 300;
                component.height = 200;

                component.connectedCallback();
                component.sendEditMessage();
                component.sendMoveMessage();
            });
            break;
        case ComponentType.ASSOCIATION:
        case ComponentType.DIRECTED_ASSOCIATION:
        case ComponentType.GENERALIZATION:
        case ComponentType.AGGREGATION:
        case ComponentType.COMPOSITION:
        case ComponentType.REALIZATION:
        case ComponentType.USAGE:
            button.addEventListener("click", () => {
                let startHead: ConnectionHead = ConnectionHead.NONE;
                let endHead: ConnectionHead = ConnectionHead.NONE;
                let line: ConnectionLine = ConnectionLine.SOLID;

                switch (diagramButton.type) {
                    case ComponentType.ASSOCIATION:
                        break;
                    case ComponentType.DIRECTED_ASSOCIATION:
                        endHead = ConnectionHead.ARROW_FILLED;
                        break;
                    case ComponentType.GENERALIZATION:
                        endHead = ConnectionHead.ARROW_STROKE;
                        break;
                    case ComponentType.COMPOSITION:
                        startHead = ConnectionHead.ROTATED_SQUARE_FILLED;
                        break;
                    case ComponentType.AGGREGATION:
                        startHead = ConnectionHead.ROTATED_SQUARE_STROKE;
                        break;
                    case ComponentType.REALIZATION:
                        line = ConnectionLine.DASHED;
                        endHead = ConnectionHead.ARROW_STROKE;
                        break;
                    case ComponentType.USAGE:
                        line = ConnectionLine.DASHED;
                        break;

                    default:
                        break;
                }

                ConnectionManager.instance.startHead = startHead;
                ConnectionManager.instance.endHead = endHead;
                ConnectionManager.instance.line = line;
                Input.movementMode = MovementMode.CONNECTION;
                Component.resetActiveComponents();
            });
            break;
    }

    return button;
}
