import { ClassComponent } from "./classComponent";
import { Component } from "./component";

export class InterfaceComponent extends ClassComponent {
    connectedCallback() {
        this.innerHTML = "";

        this.classList.add("class-component");

        this.addHeaderBlock("<<Interface>>", false);
        this.addHeaderBlock("Class");
        this.addDivider();
        this.addBlock("-date : Date");
        this.addBlock("-status : String");
        this.addDivider();
        this.addBlock("+calcTotal() : int");
        this.addBlock("+toString() : String");
    }
}

customElements.define("uml-together-interface-component", InterfaceComponent);
