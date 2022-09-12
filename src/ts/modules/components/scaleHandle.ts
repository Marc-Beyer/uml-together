export class ScaleHandle extends HTMLElement {
    constructor() {
        super();
        this.className = "scale-handle";

        this.addEventListener("mousedown", (event) => {
            if (event.button != 0) return;
            event.preventDefault();
            event.stopPropagation();
        });
    }

    connectedCallback() {
        this.innerHTML = "";
    }
}

customElements.define("uml-together-scale-handle", ScaleHandle);
