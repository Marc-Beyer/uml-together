import { ClassComponent } from "../components/classComponent";
import { InterfaceComponent } from "../components/interfaceComponent";
import { EnumerationComponent } from "../components/enumerationComponent";
import { PrimitiveComponent } from "../components/primitiveComponent";
import { Diagram, DiagramButton } from "./main";

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

function createButton(diagrammButton: DiagramButton): HTMLButtonElement {
    let button: HTMLButtonElement = document.createElement("button");
    button.textContent = diagrammButton.text;
    button.classList.add("nav-button");

    switch (diagrammButton.id) {
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
        //    Generell Buttons
        //========================
        case "note":
            break;
        default:
            button.textContent = "NON FUNCTIONAL BUTTON";
            break;
    }
    return button;
}
