import { EditText, EditTextObj, isEditTextObj } from "../elements/editText";
import { Input } from "../input";
import { MessageType } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
import { Component } from "./component";
import { ComponentType } from "./componentType";

export type EditTextHolder = {
    text: string;
    inEditMode: boolean;
};

export class ClassComponent extends Component {
    public cType = new EditText("", false, false, (pressedEnter) => {
        this.sendEditMessage();
        if (pressedEnter) {
            this.addAttribute("", true);
        }
        this.connectedCallback();
    });
    public cName = new EditText("", false, false, (pressedEnter) => {
        this.sendEditMessage();
        if (pressedEnter) {
            this.cType.inEditMode = true;
            this.cType.refresh();
        }
        this.connectedCallback();
    });
    public attributeList: EditText[] = [];
    public operationsList: EditText[] = [];

    private classHeader: HTMLDivElement | undefined = undefined;
    private attributeContainer: HTMLDivElement | undefined = undefined;
    private operationsContainer: HTMLDivElement | undefined = undefined;

    constructor(xPos: number = 0, yPos: number = 0, width: number = 275, height: number = 200, id?: string) {
        super(xPos, yPos, width, height, id);

        this.classList.add("class-component");

        this.connectedCallback();
    }

    connectedCallback() {
        if (!this.cName) return;

        this.innerHTML = "";

        // Add header
        this.addHeaderBlock();

        // Add a divider if there are attributes
        if (this.attributeList.length > 0) this.addDivider("attributeList");

        if (this.attributeContainer === undefined) {
            this.attributeContainer = document.createElement("div");
            this.attributeContainer.classList.add("container");

            for (let index = 0; index < this.attributeList.length; index++) {
                this.attributeContainer.append(this.attributeList[index]);
            }
        }
        this.append(this.attributeContainer);

        // Add a divider if there are operations
        if (this.operationsList.length > 0) this.addDivider("operationsList");

        if (this.operationsContainer === undefined) {
            this.operationsContainer = document.createElement("div");
            this.operationsContainer.classList.add("container");

            for (let index = 0; index < this.operationsList.length; index++) {
                this.operationsContainer.append(this.operationsList[index]);
            }
        }
        this.append(this.operationsContainer);

        this.classList.toggle("vertical-center", this.attributeList.length === 0 && this.operationsList.length === 0);
    }

    // Add a new attribute
    public addAttribute(editTextObj: EditTextObj | string, inEditMode: boolean = false) {
        let text: string = "";
        if (isEditTextObj(editTextObj)) {
            text = editTextObj.text;
        } else {
            text = editTextObj;
        }
        const editText = new EditText(
            text,
            inEditMode,
            true,
            (pressedEnter: boolean, moved?: number) => {
                if (moved && moved === 1) {
                    const index = this.attributeList.findIndex((et) => et === editText);
                    if (index > 0) {
                        [this.attributeList[index - 1], this.attributeList[index]] = [
                            this.attributeList[index],
                            this.attributeList[index - 1],
                        ];
                        editText.parentElement?.insertBefore(editText, editText.previousElementSibling);
                    }
                } else if (moved && moved === 2) {
                    const index = this.attributeList.findIndex((et) => et === editText);
                    if (index < this.attributeList.length - 1) {
                        [this.attributeList[index + 1], this.attributeList[index]] = [
                            this.attributeList[index],
                            this.attributeList[index + 1],
                        ];
                        if (editText.nextElementSibling) editText.parentElement?.insertBefore(editText.nextElementSibling, editText);
                    }
                }

                const newText = editText.text.trim();

                // Filter out all empty editTexts
                this.attributeList = this.attributeList.filter((editText: EditText) => {
                    if (editText.text.trim() === "" && !editText.inEditMode) {
                        editText.remove();
                        return false;
                    }
                    return true;
                });

                this.sendEditMessage();

                if (pressedEnter) {
                    if (newText === "") {
                        this.addOperation("", true);
                    } else {
                        this.addAttribute("", true);
                    }
                }
                this.connectedCallback();
            },
            inEditMode
        );
        if (isEditTextObj(editTextObj)) editText.setValues(editTextObj);
        this.attributeList.push(editText);
        this.attributeContainer?.append(editText);

        if (inEditMode) {
            this.adjustHeightIfNeeded();
        }
    }

    // Add a new operation
    public addOperation(editTextObj: EditTextObj | string, inEditMode: boolean = false) {
        let text: string = "";
        if (isEditTextObj(editTextObj)) {
            text = editTextObj.text;
        } else {
            text = editTextObj;
        }
        const editText = new EditText(
            text,
            inEditMode,
            true,
            (pressedEnter: boolean, moved?: number) => {
                if (moved && moved === 1) {
                    const index = this.operationsList.findIndex((et) => et === editText);
                    if (index > 0) {
                        [this.operationsList[index - 1], this.operationsList[index]] = [
                            this.operationsList[index],
                            this.operationsList[index - 1],
                        ];
                        editText.parentElement?.insertBefore(editText, editText.previousElementSibling);
                    }
                    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA", this.operationsList);
                } else if (moved && moved === 2) {
                    const index = this.operationsList.findIndex((et) => et === editText);
                    if (index < this.operationsList.length - 1) {
                        [this.operationsList[index + 1], this.operationsList[index]] = [
                            this.operationsList[index],
                            this.operationsList[index + 1],
                        ];
                        if (editText.nextElementSibling) editText.parentElement?.insertBefore(editText.nextElementSibling, editText);
                    }
                    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA", this.operationsList);
                }

                const newText = editText.text.trim();

                // Filter out all empty editTexts
                this.operationsList = this.operationsList.filter((editText: EditText) => {
                    if (editText.text.trim() === "" && !editText.inEditMode) {
                        editText.remove();
                        return false;
                    }
                    return true;
                });

                this.sendEditMessage();

                if (pressedEnter && newText !== "") {
                    this.addOperation("", true);
                }
                this.connectedCallback();
            },
            inEditMode
        );
        if (isEditTextObj(editTextObj)) editText.setValues(editTextObj);
        this.operationsList.push(editText);
        this.operationsContainer?.append(editText);
    }

    // Send a EDIT_COMPONENT message
    public sendEditMessage() {
        WebSocketController.instance.sent({
            type: MessageType.EDIT_COMPONENT,
            data: {
                id: this.componentId,
                classType: this.cType.getValues(),
                className: this.cName.getValues(),
                attributeList: this.attributeList.map((editText: EditText) => {
                    return editText.getValues();
                }),
                operationsList: this.operationsList.map((editText: EditText) => {
                    return editText.getValues();
                }),
            },
        });
    }

    // Get the current state of the component
    public getState() {
        return {
            ...super.getState(),
            type: ComponentType.CLASS,
            classType: this.cType.getValues(),
            className: this.cName.getValues(),
            attributeList: this.attributeList.map((editText: EditText) => {
                return editText.getValues();
            }),
            operationsList: this.operationsList.map((editText: EditText) => {
                return editText.getValues();
            }),
        };
    }

    // Handle a EDIT_COMPONENT message
    public edit(message: any): void {
        this.cType.setValues(message.classType);
        this.cName.setValues(message.className);

        // Clear the attributes and operations and remove them from the DOM
        for (let index = 0; index < this.attributeList.length; index++) {
            this.attributeList[index].remove();
        }
        for (let index = 0; index < this.operationsList.length; index++) {
            this.operationsList[index].remove();
        }
        this.attributeList = [];
        this.operationsList = [];

        // Add
        for (let index = 0; index < message.attributeList.length; index++) {
            this.addAttribute(message.attributeList[index]);
        }
        for (let index = 0; index < message.operationsList.length; index++) {
            this.addOperation(message.operationsList[index]);
        }

        this.connectedCallback();
    }

    // Add functionality to the custom context menu
    protected createContextMenu(list: Element) {
        list.append(
            this.createContextBtn("Delete Component", "Del", () => {
                Input.onDelete();
            })
        );
        list.append(this.createContextBtn("Copy Component", "Ctrl+C", () => {}));

        list.append(document.createElement("hr"));

        list.append(
            this.createContextBtn("Add Attribute", "", (event) => {
                event.preventDefault();
                event.stopPropagation();

                this.addAttribute("", true);
                this.connectedCallback();

                const contextMenu = document.getElementById("context-menu");
                if (contextMenu) contextMenu.style.display = "";
            })
        );
        list.append(
            this.createContextBtn("Add Operation", "", () => {
                this.addOperation("", true);
                this.connectedCallback();
            })
        );
        list.append(
            this.createContextBtn("Add Annotation", "", () => {
                this.cType.inEditMode = true;
                this.connectedCallback();
            })
        );

        list.append(document.createElement("hr"));
        list.append(
            this.createContextBtn("Auto Resize", "", () => {
                this.autoResize();
            })
        );
    }

    // Add the heder of the class
    protected addHeaderBlock() {
        if (this.classHeader === undefined) {
            this.classHeader = document.createElement("div");
            this.classHeader.classList.add("container", "class-head");

            this.classHeader.append(this.cType);
            this.classHeader.append(this.cName);
            this.cName.isBold = true;
            this.cName.placeholder = "enter name";
        }
        this.append(this.classHeader);
    }

    // Add a horizontal line
    protected addDivider(className?: string) {
        const hr = document.createElement("hr");
        if (className) hr.classList.add(className);
        this.append(hr);
    }
}

customElements.define("uml-together-class-component", ClassComponent);
