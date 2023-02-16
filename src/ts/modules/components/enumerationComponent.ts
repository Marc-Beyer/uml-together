import { ClassComponent } from "./classComponent";

export class EnumerationComponent extends ClassComponent {
    connectedCallback() {
        this.innerHTML = "";

        this.classList.add("class-component");

        this.addHeaderBlock("<<enumeration>>", false);
        this.addHeaderBlock("Class");
        this.addDivider();
        this.addBlock("+calcTotal() : int");
        this.addBlock("+toString() : String");
    }
}

customElements.define("uml-together-enumeration-component", EnumerationComponent);
