import { Global } from "../global";
import { Input, MovementMode } from "../input";

export class EditText extends HTMLElement {
    public text: string = "";
    public inEditMode: boolean = false;

    private static LAST_CLICKED: number = 0;
    private onChange?: Function;

    constructor(text: string, inEditMode: boolean = false, onChange?: Function) {
        super();
        this.text = text ?? "";
        this.inEditMode = inEditMode;
        this.onChange = onChange;
        this.classList.add("edit-text");

        this.addEventListener("mousedown", () => {
            const clicked = Date.now();

            if (clicked - EditText.LAST_CLICKED < Global.DB_CLICK_TIME) {
                EditText.LAST_CLICKED = 0;

                Input.movementMode = MovementMode.EDIT;

                this.inEditMode = true;
                this.connectedCallback();
            } else {
                EditText.LAST_CLICKED = clicked;
            }
        });
    }

    connectedCallback() {
        this.innerHTML = "";

        let div = document.createElement("div");

        const input = document.createElement("input");
        if (this.inEditMode) {
            input.type = "text";
            input.value = this.text;
            input.addEventListener("focusout", () => {
                this.inEditMode = false;
                this.connectedCallback();
            });
            input.addEventListener("change", () => {
                this.text = input.value;
                if (this.onChange) this.onChange(input.value);
            });
            div.append(input);
        } else {
            div.append(document.createTextNode(this.text));
        }

        this.append(div);
        input.focus();
    }
}

customElements.define("edit-text", EditText);
