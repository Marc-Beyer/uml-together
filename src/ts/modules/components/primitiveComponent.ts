import { ClassComponent } from "./classComponent";
import { Component } from "./component";

export class PrimitiveComponent extends ClassComponent {
    connectedCallback() {
        this.innerHTML = "";

        this.classList.add("class-component");

        this.addHeaderBlock("<<primitive>>", false);
        this.addHeaderBlock("Class");
        this.addDivider();
        this.addBlock("-date : Date");
        this.addBlock("-status : String");
        this.addDivider();
        this.addBlock("+calcTotal() : int");
        this.addBlock("+toString() : String");
    }
}

customElements.define("uml-together-primitive-component", PrimitiveComponent);
