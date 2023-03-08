import { EditText } from "../elements/editText";
import { MessageType } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";
import { Component } from "./component";

export type EditTextHolder = {
    text: string;
    inEditMode: boolean;
};

export class ClassComponent extends Component {
    public cType: EditTextHolder = { text: "<<Interface>>", inEditMode: false };
    public cName: EditTextHolder = { text: "Class", inEditMode: false };
    public attributeList: EditTextHolder[] = [];
    public operationsList: EditTextHolder[] = [];

    public isAbstract: boolean = false;
    public isInterface: boolean = false;
    public isEnum: boolean = false;

    constructor(xPos: number = 0, yPos: number = 0, width: number = 250, height: number = 150, id: string) {
        super(xPos, yPos, width, height, id);
        this.classList.add("class-component");

        this.cType = { text: "<<Interface>>", inEditMode: false };
        this.cName = { text: "Class", inEditMode: false };

        this.attributeList.push({ text: "+attribute1: String", inEditMode: false });
        this.attributeList.push({ text: "-attribute2: int = 42", inEditMode: false });

        this.operationsList.push({ text: "+operation1(param: String)", inEditMode: false });
        this.operationsList.push({ text: "-operation2(param: String): String", inEditMode: false });

        this.connectedCallback();
    }

    connectedCallback() {
        if (!this.cName) return;

        this.innerHTML = "";

        // Add header
        this.addHeaderBlock();

        // Add attributes
        this.attributeList = this.attributeList.filter((etHolder: EditTextHolder) => {
            return etHolder.inEditMode || etHolder.text.trim() !== "";
        });

        if (this.attributeList.length > 0) this.addDivider("attributeList");

        if (this.attributeList) {
            for (let index = 0; index < this.attributeList.length; index++) {
                this.addAttribute(index);
            }
        }

        // Add operations
        this.operationsList = this.operationsList.filter((etHolder: EditTextHolder) => {
            return etHolder.inEditMode || etHolder.text.trim() !== "";
        });

        if (this.operationsList.length > 0) this.addDivider("operationsList");

        if (this.operationsList) {
            for (let index = 0; index < this.operationsList.length; index++) {
                this.addOperation(index);
            }
        }
    }

    public sendEditMessage() {
        WebSocketController.instance.sent({
            type: MessageType.EDIT_COMPONENT,
            data: {
                id: this.componentId,
                classType: this.cType.text,
                className: this.cName.text,
                attributeList: this.attributeList.map((etHolder: EditTextHolder) => {
                    return etHolder.text;
                }),
                operationsList: this.operationsList.map((etHolder: EditTextHolder) => {
                    return etHolder.text;
                }),
            },
        });
    }

    public edit(message: any): void {
        this.cType.text = message.classType;
        this.cName.text = message.className;
        this.attributeList = [];
        this.operationsList = [];
        for (let index = 0; index < message.attributeList.length; index++) {
            this.attributeList.push({ text: message.attributeList[index], inEditMode: false });
        }
        for (let index = 0; index < message.operationsList.length; index++) {
            this.operationsList.push({ text: message.operationsList[index], inEditMode: false });
        }

        this.connectedCallback();
    }

    protected addAttribute(index: number) {
        this.append(
            new EditText(
                this.attributeList[index].text,
                this.attributeList[index].inEditMode,
                (value: string) => {
                    this.attributeList[index].text = value;

                    this.attributeList[index].inEditMode = false;
                    this.sendEditMessage();
                    if (value.trim() === "") {
                        this.operationsList.push({
                            text: "",
                            inEditMode: true,
                        });
                        this.connectedCallback();
                    } else {
                        this.attributeList.push({
                            text: "",
                            inEditMode: true,
                        });
                        Component.addActiveComponents(this, true);
                    }
                },
                (value: string) => {
                    this.attributeList[index].inEditMode = false;
                    if (value === "") {
                        this.attributeList.slice(0, index);
                    } else {
                        this.attributeList[index].inEditMode = false;
                    }
                    Component.addActiveComponents(this, true);
                }
            )
        );
    }

    protected addOperation(index: number) {
        this.append(
            new EditText(
                this.operationsList[index].text,
                this.operationsList[index].inEditMode,
                (value: string) => {
                    this.operationsList[index].text = value;

                    this.operationsList[index].inEditMode = false;
                    this.sendEditMessage();
                    if (value.trim() === "") {
                        this.connectedCallback();
                    } else {
                        this.operationsList.push({
                            text: "",
                            inEditMode: true,
                        });
                        Component.addActiveComponents(this, true);
                    }
                },
                (value: string) => {
                    this.operationsList[index].inEditMode = false;
                    if (value === "") {
                        this.operationsList.slice(0, index);
                    } else {
                        this.operationsList[index].inEditMode = false;
                    }
                    Component.addActiveComponents(this, true);
                }
            )
        );
    }

    protected addHeaderBlock() {
        let div = document.createElement("div");
        div.classList.add("class-head");

        if (this.cType && this.cType.text.trim().length > 0) {
            const classTypeEditText = new EditText(this.cType.text, this.cType.inEditMode, (value: string) => {
                this.cType.text = value;
                this.sendEditMessage();
            });
            div.append(classTypeEditText);
        }

        const classNameEditText = new EditText(this.cName.text, this.cName.inEditMode, (value: string) => {
            this.cName.text = value;
            this.sendEditMessage();
        });
        classNameEditText.classList.add("bold");
        div.append(classNameEditText);
        this.append(div);
    }

    protected addDivider(className?: string) {
        const hr = document.createElement("hr");
        if (className) hr.classList.add(className);
        this.append(hr);
    }
}

customElements.define("uml-together-class-component", ClassComponent);
