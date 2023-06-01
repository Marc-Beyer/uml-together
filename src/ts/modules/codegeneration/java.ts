import { ChatController, DebugMessageType } from "../chat/chatController";
import { ClassOperationParameter, ClassStructure, Enumeration, Modifier, Visibility } from "./interfaces";

export function getJavaEnum(enumeration: Enumeration): string {
    let code = `${visibilityToString(enumeration.visibility)}enum ${enumeration.name} {`;

    for (let index = 0; index < enumeration.values.length; index++) {
        let enumValue = enumeration.values[index];
        if (!/^[a-zA-Z]+[a-zA-Z0-9_]*$/.test(enumValue)) {
            ChatController.instance.newDebugMessage(
                `The enum value '${enumeration.name}.${enumValue}' is not valid!
            An enum value can contain any combination of letters, digits, and underscores (_), and must begin with a letter.
            It will be filtered!`,
                DebugMessageType.WARNING
            );
            enumValue = enumValue.replaceAll(/[^a-zA-Z0-9]/g, "");
            enumValue = enumValue.replace(/^[0-9]+/g, "");
        }
        if (enumValue.length === 0) {
            ChatController.instance.newDebugMessage(
                `The ${index}. enum value of '${enumeration.name}' will be skipped!`,
                DebugMessageType.WARNING
            );
        }
        code += `\n\t${enumValue.toUpperCase()}${index !== enumeration.values.length - 1 ? "," : ""}`;
    }
    code += `${enumeration.values.length > 0 ? "\n" : ""}}`;

    return code;
}

export function getJavaClass(classStructure: ClassStructure): string {
    let code = `${visibilityToString(classStructure.visibility)}`;
    switch (classStructure.modifier) {
        case Modifier.STATIC:
            code += `static class ${classStructure.name}`;
            break;
        case Modifier.INTERFACE:
            code += `interface ${classStructure.name}`;
            break;
        case Modifier.ABSTRACT:
            code += `abstract class ${classStructure.name}`;
            break;

        default:
            code += `class ${classStructure.name}`;
            break;
    }

    if (classStructure.inheritance.length > 0) {
        if (classStructure.inheritance.length > 1) {
            ChatController.instance.newDebugMessage(
                `The class '${classStructure.name}' has multiple superclasses! Thats not possible in Java! Only ${classStructure.inheritance[0]} will be used.`,
                DebugMessageType.WARNING
            );
        }
        code += ` extends ${classStructure.inheritance[0]}`;
    }

    if (classStructure.realization.length > 0) {
        code += ` implements ${classStructure.realization.join(", ")}`;
    }

    code += ` {`;

    for (let index = 0; index < classStructure.attributes.length; index++) {
        const attribute = classStructure.attributes[index];
        code += `\n\t${visibilityToString(attribute.visibility)}`;
        code += `${attribute.isStatic ? "static " : ""}`;
        code += `${attribute.type.replace(/^\s*/g, "")} ${attribute.name}`;
        code += `${attribute.defaultValue !== null ? ` = ${attribute.defaultValue}` : ""}`;
        code += `;`;
    }
    if (classStructure.attributes.length > 0) code += "\n";

    for (let index = 0; index < classStructure.operations.length; index++) {
        const operation = classStructure.operations[index];

        code += `\n\t${visibilityToString(operation.visibility)}`;
        code += `${operation.isStatic ? "static " : ""}`;
        code += `${classStructure.modifier === Modifier.ABSTRACT && operation.isAbstract ? "abstract " : ""}`;
        code += `${operation.type} ${operation.name}(`;
        code += getJavaParameter(operation.parameter);
        code += `){\n\t\tthrow new UnsupportedOperationException("Method not yet implemented");\n\t}\n`;
    }

    code += `}`;

    return code;
}

function getJavaParameter(parameter: ClassOperationParameter[]): string {
    let code = "";
    for (let index = 0; index < parameter.length; index++) {
        const element = parameter[index];
        code += `${element.type} ${element.name}`;
        code += `${element.defaultValue !== null ? ` = ${element.defaultValue}` : ""}`;
        code += `, `;
    }
    if (parameter.length > 0) return code.slice(0, -2);
    return code;
}

function visibilityToString(visibility: Visibility): string {
    switch (visibility) {
        case Visibility.PRIVATE:
            return "private ";
            break;
        case Visibility.PROTECTED:
            return "protected ";
            break;
        case Visibility.PUBLIC:
            return "public ";
            break;
        case Visibility.PACKAGE:
            return "";
            break;
        case Visibility.DEFAULT:
            return "";
            break;
    }
}
