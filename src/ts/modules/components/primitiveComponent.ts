import { Component } from "./component";

export class PrimitiveComponent extends Component {
    constructor(xPos: number = 0, yPos: number = 0, width: number = 0, height: number = 0) {
        super(xPos, yPos, width, height);
    }

    connectedCallback() {
        this.innerHTML = "&lt;&lt;primitive&gt;&gt;<br>Class";
        this.append(document.createTextNode("+ public test: int"));
    }
}

customElements.define("uml-together-primitive-component", PrimitiveComponent);
