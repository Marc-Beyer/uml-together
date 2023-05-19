import { ChatController, DebugMessageType } from "../chat/chatController";
import { ClassComponent } from "../components/classComponent";
import { EditText } from "../elements/editText";
import { Global, ProgrammingLanguage } from "../settings/global";
import { ClassAttribute, ClassOperation, ClassOperationParameter, ClassStructure, Enumeration, Modifier, Visibility } from "./interfaces";
import { getJavaClass, getJavaEnum } from "./java";

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
    } else if (classComponent.cName.isItalic) {
        modifier = Modifier.ABSTRACT;
    }

    const stereotype = classComponent.cType.text;

    switch (stereotype.toLowerCase()) {
        case "<<interface>>":
            modifier = Modifier.INTERFACE;
            break;
        case "<<abstract>>":
            modifier = Modifier.ABSTRACT;
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
    let { visibility, clearedName } = getVisibility(classComponent.cName.text);
    return {
        name: clearedName,
        modifier,
        visibility,
        attributes: getClassAttributes(classComponent.attributeList),
        operations: getClassOperations(classComponent.operationsList),
    };
}

function getClassAttributes(attributeList: EditText[]) {
    const attributes: ClassAttribute[] = [];
    for (let index = 0; index < attributeList.length; index++) {
        const { visibility, clearedName } = getVisibility(attributeList[index].text);
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
            isStatic: attributeList[index].isUnderlined,
            defaultValue: attrDefaultValue,
        });
    }
    return attributes;
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
            isAbstract: operationsList[index].isItalic,
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
    }

    return {
        visibility,
        clearedName: name.replace(/^[+\-#]+\s*/g, ""),
    };
}
