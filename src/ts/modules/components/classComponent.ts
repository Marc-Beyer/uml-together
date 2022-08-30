import { Component } from "./component";

export class ClassComponent extends Component {
    constructor(xPos: number = 0, yPos: number = 0, width: number = 0, height: number = 0) {
        super(xPos, yPos, width, height);
    }

    connectedCallback() {
        this.innerHTML = "Class";
        this.append(document.createTextNode("+ public test: int"));
    }
}

customElements.define("uml-together-class-component", ClassComponent);
