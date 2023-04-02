import { EditText } from "../elements/editText";
import { Grid } from "../grid";
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
    public cType: EditTextHolder = { text: "<<Interface>>", inEditMode: false };
    public cName: EditTextHolder = { text: "Class", inEditMode: false };
    public attributeList: EditTextHolder[] = [];
    public operationsList: EditTextHolder[] = [];

    public isAbstract: boolean = false;
    public isInterface: boolean = false;
    public isEnum: boolean = false;

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

    public getState() {
        return {
            ...super.getState(),
            type: ComponentType.CLASS,
            classType: this.cType.text,
            className: this.cName.text,
            attributeList: this.attributeList.map((etHolder: EditTextHolder) => {
                return etHolder.text;
            }),
            operationsList: this.operationsList.map((etHolder: EditTextHolder) => {
                return etHolder.text;
            }),
        };
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

    protected createContextMenu(list: Element) {
        list.append(
            this.createContextBtn("Delete Component", "Del", () => {
                Input.removeComponents();
            })
        );
        list.append(this.createContextBtn("Copy Component", "Ctrl+C", () => {}));

        list.append(document.createElement("hr"));

        list.append(
            this.createContextBtn("Add Attribute", "", () => {
                this.attributeList.push({
                    text: "",
                    inEditMode: true,
                });
                this.connectedCallback();
            })
        );
        list.append(
            this.createContextBtn("Add Operation", "", () => {
                this.operationsList.push({
                    text: "",
                    inEditMode: true,
                });
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
                this.style.width = "";
                this.style.height = "";
                const rect = this.getBoundingClientRect();
                let width = rect.width;
                let height = rect.height;

                this.width = width / Grid.xZoom + Grid.xRaster;
                this.height = height / Grid.yZoom;
                this.sendMoveMessage();
            })
        );
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
                    this.attributeList[index].text = value;
                    this.attributeList[index].inEditMode = false;
                    this.sendEditMessage();

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
                    this.operationsList[index].text = value;
                    this.operationsList[index].inEditMode = false;
                    this.sendEditMessage();

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

        if (this.cType && (this.cType.text.trim().length > 0 || this.cType.inEditMode)) {
            const classTypeEditText = new EditText(
                this.cType.text,
                this.cType.inEditMode,
                (value: string) => {
                    this.cType.text = value;
                    this.cType.inEditMode = false;
                    this.sendEditMessage();

                    this.attributeList.push({
                        text: "",
                        inEditMode: true,
                    });
                    Component.addActiveComponents(this, true);
                },
                (value: string) => {
                    this.cType.text = value;
                    this.cType.inEditMode = false;
                    this.sendEditMessage();

                    Component.addActiveComponents(this, true);
                }
            );
            div.append(classTypeEditText);
        }

        const classNameEditText = new EditText(
            this.cName.text.trim().length > 0 ? this.cName.text : "Class",
            this.cName.inEditMode,
            (value: string) => {
                this.cName.text = value;
                this.cName.inEditMode = false;
                this.sendEditMessage();

                this.cType.inEditMode = true;
                Component.addActiveComponents(this, true);
            },
            (value: string) => {
                this.cName.text = value;
                this.cName.inEditMode = false;
                this.sendEditMessage();

                Component.addActiveComponents(this, true);
            }
        );
        this.cName.text.trim().length > 0 ? classNameEditText.classList.add("bold") : classNameEditText.classList.add("no-name");
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
