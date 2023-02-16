export class EditText extends HTMLElement {
    private text: string = "";

    constructor(text?: string) {
        super();
        this.text = text ?? "";
    }

    connectedCallback() {
        this.addEventListener("click", (event) => {
            console.log("click");
        });
        this.addEventListener("dblclick", (event) => {
            console.log("dblclick");
        });

        this.addEventListener("mousedown", (event) => {
            console.log("mousedown");
        });

        let div = document.createElement("div");
        div.append(document.createTextNode(this.text));
        this.append(div);
        div.addEventListener("click", (event) => {
            console.log("click on div");
        });
    }
}

customElements.define("edit-text", EditText);
