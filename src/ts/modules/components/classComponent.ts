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

        this.addHeaderBlock();

        this.addDivider();

        if (this.attributeList) {
            for (let index = 0; index < this.attributeList.length; index++) {
                this.addBlock(this.attributeList[index]);
            }
        }

        this.addDivider();

        if (this.operationsList) {
            for (let index = 0; index < this.operationsList.length; index++) {
                this.addBlock(this.operationsList[index]);
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

    protected addBlock(etHolder: EditTextHolder) {
        this.append(
            new EditText(etHolder.text, etHolder.inEditMode, (value: string) => {
                etHolder.text = value;
                this.sendEditMessage();
            })
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

    protected addDivider() {
        this.append(document.createElement("hr"));
    }
}

customElements.define("uml-together-class-component", ClassComponent);
