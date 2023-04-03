import { Input, MovementMode } from "../input";

export class EditText extends HTMLElement {
    public text: string = "";
    public inEditMode: boolean = false;

    private container: HTMLDivElement | undefined = undefined;
    private input: HTMLInputElement | undefined = undefined;
    private textElement: HTMLDivElement | undefined = undefined;

    private callback;

    constructor(text: string, inEditMode: boolean = false, callback?: (pressedEnter: boolean) => any) {
        super();
        this.text = text ?? "";
        this.inEditMode = inEditMode;
        this.classList.add("edit-text");
        this.callback = callback;

        this.addEventListener("dblclick", () => {
            Input.movementMode = MovementMode.EDIT;
            this.inEditMode = true;
            this.connectedCallback();
        });

        this.refresh();
    }

    public refresh() {
        this.connectedCallback();
    }

    connectedCallback() {
        this.innerHTML = "";

        if (this.container === undefined) {
            this.container = document.createElement("div");
            this.input = document.createElement("input");
            this.input.type = "text";
            this.input.addEventListener("focusout", () => {
                this.inEditMode = false;
                if (this.input) this.text = this.input.value;
                this.connectedCallback();
                if (this.callback !== undefined) this.callback(false);
                Input.movementMode = MovementMode.COMPONENT;
            });
            this.input.addEventListener("keyup", (event: KeyboardEvent) => {
                if (event.key === "Enter" || event.keyCode === 13) {
                    this.inEditMode = false;
                    if (this.input) this.text = this.input.value;
                    this.connectedCallback();
                    if (this.callback !== undefined) this.callback(true);
                }
            });
            this.container.append(this.input);

            this.textElement = document.createElement("div");
            this.container.append(this.textElement);
        }

        this.append(this.container);

        if (this.input) {
            this.input.style.display = this.inEditMode ? "block" : "none";
            if (!this.inEditMode) this.input.value = this.text;
        }
        if (this.textElement) {
            this.textElement.style.display = this.inEditMode ? "none" : "block";
            this.textElement.innerText = this.text;
        }

        if (this.inEditMode) this.input?.focus();
    }
}

customElements.define("edit-text", EditText);
