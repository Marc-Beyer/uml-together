export enum Modifier {
    STATIC,
    INTERFACE,
    ABSTRACT,
    NONE,
}

export enum Visibility {
    DEFAULT,
    PRIVATE,
    PROTECTED,
    PUBLIC,
}

export interface ClassAttribute {
    visibility: Visibility;
    name: string;
    type: string;
    isStatic: boolean;
    defaultValue: string | null;
}

export interface ClassOperationParameter {
    name: string;
    type: string;
    defaultValue: string | null;
}

export interface ClassOperation {
    visibility: Visibility;
    name: string;
    type: string;
    parameter: ClassOperationParameter[];
    isStatic: boolean;
    isAbstract: boolean;
}

export interface ClassStructure {
    name: string;
    modifier: Modifier;
    inheritance: string[];
    realization: string[];
    visibility: Visibility;
    attributes: ClassAttribute[];
    operations: ClassOperation[];
}

export interface Enumeration {
    name: string;
    visibility: Visibility;
    values: string[];
}
