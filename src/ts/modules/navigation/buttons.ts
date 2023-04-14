import { ClassComponent } from "../components/classComponent";
import { Diagram, DiagramButton } from "./main";
import { ComponentType } from "../components/componentType";
import { ComponentManager } from "../components/componentManager";
import { NoteComponent } from "../components/noteComponent";
import { Input, MovementMode } from "../input";
import { Component } from "../components/component";
import { ConnectionManager } from "../connections/connectionManager";

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

                component.addAttribute("literal1");
                component.addAttribute("literal2");

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
        case ComponentType.GENERALIZATION:
        case ComponentType.USAGE:
        case ComponentType.ASSOCIATION:
        case ComponentType.AGGREGATION:
        case ComponentType.COMPOSITION:
            button.addEventListener("click", () => {
                ConnectionManager.instance.connectionType = diagramButton.type;
                Input.movementMode = MovementMode.CONNECTION;
                Component.resetActiveComponents();
            });
            break;
    }

    /*
    switch (diagramButton.id) {
        //========================
        // Class diagram Buttons
        //========================
        case "class":
            button.addEventListener("click", () => {
                new ClassComponent();
            });
            break;
        case "interface":
            button.addEventListener("click", () => {
                new InterfaceComponent();
            });
            break;
        case "enumeration":
            button.addEventListener("click", () => {
                new EnumerationComponent();
            });
            break;
        case "primitive":
            button.addEventListener("click", () => {
                new PrimitiveComponent();
            });
            break;
        case "generalizationClass":
            break;
        case "usage":
            break;
        case "associationClass":
            break;
        case "aggregation":
            break;
        case "composition":
            break;
        //========================
        //Use case diagram Buttons
        //========================
        case "useCase":
            break;
        case "associationUseCase":
            break;
        case "actor":
            break;
        case "system":
            break;
        case "include":
            break;
        case "exclude":
            break;
        case "dependency":
            break;
        case "generalizationUseCase":
            break;
        //========================
        //    Activity Buttons
        //========================
        case "activity":
            break;
        case "action":
            break;
        case "acceptEventAction":
            break;
        case "acceptTimeEventAction":
            break;
        case "sendSignalAction":
            break;
        case "decisionNode":
            break;
        case "forkNode":
            break;
        case "initialNode":
            break;
        case "activityFinalNode":
            break;
        case "controlFlow":
            break;
        case "exceptionHandler":
            break;
        //========================
        //    General Buttons
        //========================
        case "note":
            break;
        default:
            button.textContent = "NON FUNCTIONAL BUTTON";
            break;
    }
    */
    return button;
}
