import { Component } from "./component";

export class ClassComponent extends Component {
    connectedCallback() {
        this.innerHTML = "";

        this.classList.add("class-component");

        this.addHeaderBlock("Class");
        this.addDivider();
        this.addBlock("-date : Date");
        this.addBlock("-status : String");
        this.addDivider();
        this.addBlock("+calcTotal() : int");
        this.addBlock("+toString() : String");
    }

    protected addBlock(text: string) {
        let div = document.createElement("div");
        div.append(document.createTextNode(text));
        this.append(div);
    }

    protected addHeaderBlock(text: string, bold: boolean = true) {
        let div = document.createElement("div");
        div.append(document.createTextNode(text));
        div.style.alignSelf = "center";
        if (bold) div.style.fontWeight = "bold";
        this.append(div);
    }

    protected addDivider() {
        this.append(document.createElement("hr"));
    }
}

customElements.define("uml-together-class-component", ClassComponent);
