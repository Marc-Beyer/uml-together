import { ChatController, DebugMessageType } from "../chat/chatController";
import { ClassComponent } from "../components/classComponent";
import { ComponentType } from "../components/componentType";
import { EditText } from "../elements/editText";
import { Global, ProgrammingLanguage } from "../settings/global";
import { ClassAttribute, ClassOperation, ClassOperationParameter, ClassStructure, Enumeration, Modifier, Visibility } from "./interfaces";
import { getJavaClass, getJavaEnum } from "./java";

export enum ConnectionSide {
    NONE,
    START,
    END,
    BOTH,
}

export enum ConnectionAnnotation {
    NONE,
    SINGLE,
    MULTIPLE,
}

export function getCodeFromClassComponent(classComponent: ClassComponent): { name: string; code: string } | null {
    const { element, isClass } = getClassStructureOrEnum(classComponent);

    switch (Global.PROGRAMMING_LANG) {
        case ProgrammingLanguage.Java:
            if (isClass) {
                return { name: `${element.name}.java`, code: getJavaClass(element as ClassStructure) };
            } else {
                return { name: `${element.name}.java`, code: getJavaEnum(element as Enumeration) };
            }
            break;
    }

    ChatController.instance.newDebugMessage(`${ProgrammingLanguage[Global.PROGRAMMING_LANG]} is not supported yet!`);
    return null;
}

function getClassStructureOrEnum(classComponent: ClassComponent): { element: ClassStructure | Enumeration; isClass: boolean } {
    let modifier: Modifier = Modifier.NONE;

    if (classComponent.cName.isUnderlined) {
        modifier = Modifier.STATIC;
    } else if (classComponent.cName.isItalic || classComponent.cName.text.toLowerCase().includes("{abstract}")) {
        modifier = Modifier.ABSTRACT;
    }

    const stereotype = classComponent.cType.text;

    switch (stereotype.toLowerCase()) {
        case "<<interface>>":
            modifier = Modifier.INTERFACE;
            break;
        case "<<utility>>":
        case "<<static>>":
            modifier = Modifier.STATIC;
            break;
        case "<<enum>>":
        case "<<enumeration>>":
            return { element: getEnumFromClass(classComponent), isClass: false };
            break;
    }

    return { element: getClassStructure(classComponent, modifier), isClass: true };
}

function getClassStructure(classComponent: ClassComponent, modifier: Modifier): ClassStructure {
    const { visibility, clearedName } = getVisibility(classComponent.cName.text);
    const { realization, inheritance, attributes } = getClassAttributes(classComponent);
    return {
        name: clearedName,
        modifier,
        visibility,
        realization,
        inheritance,
        attributes,
        operations: getClassOperations(classComponent.operationsList),
    };
}

function getClassAttributes(classComponent: ClassComponent): {
    realization: string[];
    inheritance: string[];
    attributes: ClassAttribute[];
} {
    const attributes: ClassAttribute[] = [];
    let realization: string[] = [];
    let inheritance: string[] = [];

    for (let index = 0; index < classComponent.attributeList.length; index++) {
        const { visibility, clearedName } = getVisibility(classComponent.attributeList[index].text);
        const attrSplit = clearedName.split(":");
        const attrName = attrSplit[0];
        let attrType = attrSplit[1];
        let attrDefaultValue = null;
        const attrTypeSplit = attrType.split("=");
        if (attrTypeSplit.length > 1) {
            attrType = attrTypeSplit[0];
            attrDefaultValue = attrTypeSplit[1].replace(/^\s*/g, "");
        }
        attributes.push({
            visibility,
            name: attrName,
            type: attrType.replaceAll(/\s*/g, ""),
            isStatic: classComponent.attributeList[index].isUnderlined,
            defaultValue: attrDefaultValue,
        });
    }

    for (const connection of classComponent.connections) {
        const { type, isFlipped } = connection.getTypeAndDirection();
        if (type === undefined) {
            ChatController.instance.newDebugMessage(
                `One connection of ${classComponent.cName.text} will be skipped!`,
                DebugMessageType.WARNING
            );
            continue;
        }

        const { side, other, annotation } = connection.getSide(classComponent, isFlipped);

        if (!(other instanceof ClassComponent)) continue;

        const { clearedName } = getVisibility(other.cName.text);
        const attributeName = connection.middleText.replaceAll(/ /g, "").trim();

        switch (type) {
            case ComponentType.GENERALIZATION:
                if (side === ConnectionSide.START) inheritance.push(clearedName);
                break;
            case ComponentType.REALIZATION:
                if (side === ConnectionSide.START) realization.push(clearedName);

                break;
            case ComponentType.ASSOCIATION:
                if (annotation === ConnectionAnnotation.SINGLE) {
                    attributes.push({
                        visibility: Visibility.PRIVATE,
                        name: attributeName !== "" ? attributeName : `${clearedName.charAt(0).toLowerCase()}${clearedName.slice(1)}`,
                        type: clearedName,
                        isStatic: false,
                        defaultValue: null,
                    });
                } else if (annotation === ConnectionAnnotation.MULTIPLE) {
                    attributes.push({
                        visibility: Visibility.PRIVATE,
                        name: attributeName !== "" ? attributeName : `${clearedName.charAt(0).toLowerCase()}${clearedName.slice(1)}`,
                        type: `${clearedName}[]`,
                        isStatic: false,
                        defaultValue: null,
                    });
                }
                break;
            case ComponentType.AGGREGATION:
            case ComponentType.DIRECTED_ASSOCIATION:
            case ComponentType.COMPOSITION:
                if (side === ConnectionSide.END) continue;

                if (annotation === ConnectionAnnotation.MULTIPLE) {
                    attributes.push({
                        visibility: Visibility.PRIVATE,
                        name: attributeName !== "" ? attributeName : `${clearedName.charAt(0).toLowerCase()}${clearedName.slice(1)}`,
                        type: `${clearedName}[]`,
                        isStatic: false,
                        defaultValue: null,
                    });
                } else {
                    attributes.push({
                        visibility: Visibility.PRIVATE,
                        name: attributeName !== "" ? attributeName : `${clearedName.charAt(0).toLowerCase()}${clearedName.slice(1)}`,
                        type: clearedName,
                        isStatic: false,
                        defaultValue: null,
                    });
                }

                break;

            default:
                break;
        }
    }

    return { realization, inheritance, attributes };
}

function getParameter(operationParameter: string): ClassOperationParameter[] {
    if (operationParameter.trim() === "") return [];

    let parameter: ClassOperationParameter[] = [];

    for (const para of operationParameter.split(",")) {
        const paraSplit = para.split(":");

        let operationType = paraSplit[1];
        let operationDefaultValue = null;
        const operationTypeSplit = operationType.split("=");
        if (operationTypeSplit.length > 1) {
            operationType = operationTypeSplit[0];
            operationDefaultValue = operationTypeSplit[1].replace(/^\s*/g, "");
        }

        parameter.push({
            type: operationType.replaceAll(/\s*/g, ""),
            name: paraSplit[0].replaceAll(/\s*/g, ""),
            defaultValue: operationDefaultValue,
        });
    }

    return parameter;
}

function getClassOperations(operationsList: EditText[]) {
    const operations: ClassOperation[] = [];
    for (let index = 0; index < operationsList.length; index++) {
        const { visibility, clearedName } = getVisibility(operationsList[index].text);
        const operationSplit = clearedName.split("(");
        const operationName = operationSplit[0];
        const operationRest = operationSplit[1];

        if (operationRest == undefined) {
            ChatController.instance.newDebugMessage(`The operations ${clearedName} will be skipped!`, DebugMessageType.WARNING);
            continue;
        }

        const operationParameter = operationRest.split(")")[0];
        let operationType = operationRest.split(")")[1] ?? "void";
        if (operationType.trim() === "") {
            operationType = "void";
        } else {
            operationType = operationType.replace(/^[:\s]*/g, "");
        }

        operations.push({
            visibility,
            type: operationType,
            name: operationName,
            isAbstract: operationsList[index].isItalic || operationsList[index].text.toLowerCase().includes("{abstract}"),
            isStatic: operationsList[index].isUnderlined,
            parameter: getParameter(operationParameter),
        });
    }
    return operations;
}

function getEnumFromClass(enumeration: ClassComponent): Enumeration {
    const { visibility, clearedName } = getVisibility(enumeration.cName.text);
    return {
        name: clearedName,
        visibility,
        values: enumeration.attributeList.map((attribute) => attribute.text),
    };
}

function getVisibility(name: string) {
    let visibility = Visibility.DEFAULT;

    if (name.startsWith("-")) {
        visibility = Visibility.PRIVATE;
    } else if (name.startsWith("+")) {
        visibility = Visibility.PUBLIC;
    } else if (name.startsWith("#")) {
        visibility = Visibility.PROTECTED;
    } else if (name.startsWith("~")) {
        visibility = Visibility.PACKAGE;
    }

    return {
        visibility,
        clearedName: name.replace(/^[+\-#]+\s*/g, "").replace(/\s*{.*}\s*/g, ""),
    };
}
