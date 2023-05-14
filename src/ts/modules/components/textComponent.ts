import { EditText } from "../elements/editText";
import { Component } from "./component";

export class TextComponent extends Component {
    public text = new EditText("1..0", false, () => {
        //this.sendEditMessage();
        this.connectedCallback();
    });

    constructor(xPos: number = 0, yPos: number = 0, width: number = 275, height: number = 200, id?: string) {
        super(xPos, yPos, width, height, id);

        this.classList.add("text-component");

        this.connectedCallback();
    }
}

customElements.define("uml-together-text-component", TextComponent);
