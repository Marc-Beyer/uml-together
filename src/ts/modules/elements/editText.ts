import { Input, MovementMode } from "../input";

export interface EditTextObj {
    text: string;
    isBold: boolean;
    isUnderlined: boolean;
    isItalic: boolean;
}

export function isEditTextObj(editTextObj: any): editTextObj is EditTextObj {
    if (editTextObj.text === undefined) {
        return false;
    }
    if (editTextObj.isBold === undefined) {
        return false;
    }
    if (editTextObj.isUnderlined === undefined) {
        return false;
    }
    if (editTextObj.isItalic === undefined) {
        return false;
    }
    return true;
}

export class EditText extends HTMLElement {
    public text: string = "";
    public placeholder: string = "";
    public inEditMode: boolean = false;
    public isMultiline: boolean = false;

    private container: HTMLDivElement | undefined = undefined;
    private btnContainer: HTMLDivElement | undefined = undefined;
    private input: HTMLInputElement | undefined = undefined;
    private textArea: HTMLTextAreaElement | undefined = undefined;
    private textElement: HTMLDivElement | undefined = undefined;

    private boldBtn: HTMLButtonElement | undefined = undefined;
    private underlinedBtn: HTMLButtonElement | undefined = undefined;
    private italicBtn: HTMLButtonElement | undefined = undefined;

    private callback;

    private _isBold: boolean = false;
    private _isUnderlined: boolean = false;
    private _isItalic: boolean = false;

    public get isBold() {
        return this._isBold;
    }
    public set isBold(value: boolean) {
        this._isBold = value;
        if (this._isBold) {
            this.classList.add("bold");
        } else {
            this.classList.remove("bold");
        }
        this.refresh();
    }

    public get isUnderlined() {
        return this._isUnderlined;
    }
    public set isUnderlined(value: boolean) {
        this._isUnderlined = value;
        if (this._isUnderlined) {
            this.classList.add("underlined");
        } else {
            this.classList.remove("underlined");
        }
        this.refresh();
    }

    public get isItalic() {
        return this._isItalic;
    }
    public set isItalic(value: boolean) {
        this._isItalic = value;
        if (this._isItalic) {
            this.classList.add("italic");
        } else {
            this.classList.remove("italic");
        }
        this.refresh();
    }

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

    public setValues(editTextObj: EditTextObj) {
        this.text = editTextObj.text;
        this.isBold = editTextObj.isBold;
        this.isUnderlined = editTextObj.isUnderlined;
        this.isItalic = editTextObj.isItalic;
    }

    public getValues(): EditTextObj {
        return {
            text: this.text,
            isBold: this.isBold,
            isUnderlined: this.isUnderlined,
            isItalic: this.isItalic,
        };
    }

    public refresh() {
        this.connectedCallback();
    }

    connectedCallback() {
        this.innerHTML = "";

        if (this.container === undefined) {
            this.container = document.createElement("div");
            this.container.classList.add("et-container");
            this.container.addEventListener("focusout", (event) => {
                if (event.currentTarget && event.relatedTarget) {
                    if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) return;
                }

                this.inEditMode = false;
                if (this.isMultiline) {
                    if (this.textArea) this.text = this.textArea.value;
                } else {
                    if (this.input) this.text = this.input.value;
                }
                this.connectedCallback();
                if (this.callback !== undefined) this.callback(false);
                Input.movementMode = MovementMode.COMPONENT;
            });

            this.textArea = document.createElement("textarea");
            this.textArea.style.display = "none";
            this.textArea.addEventListener("keyup", (event: KeyboardEvent) => {
                if ((event.key === "Enter" || event.keyCode === 13) && event.ctrlKey) {
                    this.inEditMode = false;
                    if (this.textArea) this.text = this.textArea.value;
                    this.connectedCallback();
                    if (this.callback !== undefined) this.callback(true);
                } else if (event.key === "Delete" || event.keyCode === 46) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
            this.container.append(this.textArea);

            this.input = document.createElement("input");
            this.input.style.display = "none";
            this.input.type = "text";
            this.input.addEventListener("keyup", (event: KeyboardEvent) => {
                if (event.key === "Enter" || event.keyCode === 13) {
                    this.inEditMode = false;
                    if (this.input) this.text = this.input.value;
                    this.connectedCallback();
                    if (this.callback !== undefined) this.callback(true);
                } else if (event.key === "Delete" || event.keyCode === 46) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
            this.container.append(this.input);

            this.textElement = document.createElement("div");
            this.textElement.classList.add("text");
            this.container.append(this.textElement);

            this.btnContainer = document.createElement("div");
            this.btnContainer.classList.add("btn-container");

            this.boldBtn = document.createElement("button");
            this.boldBtn.append(document.createTextNode("B"));
            this.boldBtn.classList.add("et-button");
            this.boldBtn.classList.add("bold-button");
            this.boldBtn.addEventListener("click", () => {
                this.isBold = !this.isBold;
            });
            this.btnContainer.append(this.boldBtn);

            this.underlinedBtn = document.createElement("button");
            this.underlinedBtn.append(document.createTextNode("U"));
            this.underlinedBtn.classList.add("et-button");
            this.underlinedBtn.classList.add("underlined-button");
            this.underlinedBtn.addEventListener("click", () => {
                this.isUnderlined = !this.isUnderlined;
            });
            this.btnContainer.append(this.underlinedBtn);

            this.italicBtn = document.createElement("button");
            this.italicBtn.append(document.createTextNode("I"));
            this.italicBtn.classList.add("et-button");
            this.italicBtn.classList.add("italic-button");
            this.italicBtn.addEventListener("click", () => {
                this.isItalic = !this.isItalic;
            });
            this.btnContainer.append(this.italicBtn);

            this.container.append(this.btnContainer);
        }

        this.append(this.container);

        if (this.isMultiline) {
            if (this.textArea) {
                this.textArea.style.display = this.inEditMode ? "" : "none";
                if (!this.inEditMode) this.textArea.value = this.text;
            }
        } else {
            if (this.input) {
                this.input.style.display = this.inEditMode ? "" : "none";
                if (!this.inEditMode) this.input.value = this.text;
            }
        }
        if (this.btnContainer) {
            this.btnContainer.style.display = this.inEditMode ? "" : "none";
        }
        if (this.textElement) {
            this.textElement.style.display = this.inEditMode ? "none" : "";
            console.log("this.text", this.text);

            if (this.text.trim() === "") {
                this.textElement.innerText = this.placeholder;
                this.textElement.classList.add("placeholder");
            } else {
                this.textElement.innerText = this.text;
                this.textElement.classList.remove("placeholder");
            }
        }

        if (this.inEditMode) {
            if (this.isMultiline) {
                this.textArea?.focus();
            } else {
                this.input?.focus();
            }
        }
    }
}

customElements.define("edit-text", EditText);
