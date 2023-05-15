import { ChatController, DebugMessageType } from "../chat/chatController";
import { ClassComponent } from "../components/classComponent";
import { Connection } from "../connections/connection";

export function getCodeFromClassComponent(classComponent: ClassComponent): { name: string; code: string } | null {
    const isStatic = classComponent.cName.isUnderlined;
    const className = classComponent.cName.text;
    const attributes = classComponent.attributeList.map((attribute) => attribute.text);
    const operations = classComponent.operationsList.map((operation) => operation.text);
    const stereotype = classComponent.cType.text;
    switch (stereotype.toLowerCase()) {
        case "<<interface>>":
            return getClassCode(className, attributes, operations, classComponent.connections, "interface");
            break;
        case "<<enum>>":
        case "<<enumeration>>":
            return getEnumCode(className, attributes);
            break;
        case "<<abstract>>":
            return getClassCode(className, attributes, operations, classComponent.connections, "abstract class");
            break;
        case "":
            return getClassCode(className, attributes, operations, classComponent.connections, `${isStatic ? "static " : ""}class`);
            break;
        case "<<utility>>":
        case "<<static>>":
            return getClassCode(className, attributes, operations, classComponent.connections, "static class");
            break;

        default:
            ChatController.instance.newDebugMessage(`Unknown stereotype '${stereotype}'! It will be ignored!`, DebugMessageType.WARNING);
            return getClassCode(className, attributes, operations, classComponent.connections, `${isStatic ? "static " : ""}class`);
            break;
    }
    return null;
}

function getClassCode(
    className: string,
    attributes: string[],
    operations: string[],
    connections: Connection[],
    classType = "class"
): { name: string; code: string } {
    let { visibility, clearedName } = getVisibility(className);
    className = clearedName;

    let code = `${visibility}${classType} ${className} {`;

    for (let index = 0; index < attributes.length; index++) {
        let { visibility, clearedName } = getVisibility(attributes[index]);
        let attrSplit = clearedName.split(":");
        let attrName = attrSplit[0];
        let attrType = attrSplit[1];
        code += `\n\t${visibility}${attrType.replace(/^\s*/g, "")} ${attrName};`;
    }
    if (attributes.length > 0) code += "\n";

    for (let index = 0; index < operations.length; index++) {
        let { visibility, clearedName } = getVisibility(operations[index]);
        let operationSplit = clearedName.split("(");
        let operationName = operationSplit[0];
        let operationRest = operationSplit[1];
        if (operationRest == undefined) {
            ChatController.instance.newDebugMessage(
                `The operations ${operations[index]} of '${className}' will be skipped!`,
                DebugMessageType.WARNING
            );
            continue;
        }
        let operationParameter = operationRest.split(")")[0];
        operationParameter = getParameter(operationParameter);

        let operationType = operationRest.split(")")[1] ?? "void";
        operationType = operationType.replace(/^[:\s]*/g, "");
        if (operationType.trim() === "") operationType = "void";

        code += `\n\t${visibility}${operationType} ${operationName}(${operationParameter}){}`;
    }
    if (attributes.length > 0) code += "\n";

    code += `}`;
    return { code, name: className };
}

function getEnumCode(enumName: string, enumValues: string[]): { code: string; name: string } {
    const { visibility, clearedName } = getVisibility(enumName);

    let code = `${visibility}enum ${clearedName} {`;
    for (let index = 0; index < enumValues.length; index++) {
        let enumValue = enumValues[index];
        if (!/^[a-zA-Z]+[a-zA-Z0-9_]*$/.test(enumValue)) {
            ChatController.instance.newDebugMessage(
                `The enum value '${enumName}.${enumValue}' is not valid!
            An enum value can contain any combination of letters, digits, and underscores (_), and must begin with a letter.
            It will be filtered!`,
                DebugMessageType.WARNING
            );
            enumValue = enumValue.replaceAll(/[^a-zA-Z0-9]/g, "");
            enumValue = enumValue.replace(/^[0-9]+/g, "");
        }
        if (enumValue.length === 0) {
            ChatController.instance.newDebugMessage(`The ${index}. enum value of '${enumName}' will be skipped!`, DebugMessageType.WARNING);
        }
        code += `\n\t${enumValue.toUpperCase()}${index !== enumValues.length - 1 ? "," : ""}`;
    }
    code += `${enumValues.length > 0 ? "\n" : ""}}`;
    return { code, name: clearedName };
}

function getVisibility(name: string) {
    let visibility = "";
    if (name.startsWith("-")) {
        visibility = "private ";
    } else if (name.startsWith("+")) {
        visibility = "public ";
    } else if (name.startsWith("#")) {
        visibility = "protected ";
    }

    return {
        visibility,
        clearedName: name.replace(/^[+\-#]+\s*/g, ""),
    };
}

function getParameter(operationParameter: string): string {
    if (operationParameter.trim() === "") return "";

    let parameter = "";

    for (const para of operationParameter.split(",")) {
        const paraSplit = para.split(":");
        parameter += `${paraSplit[1].replace(/^\s*/g, "")} ${paraSplit[0]},`;
    }

    return parameter.slice(0, -1);
}
