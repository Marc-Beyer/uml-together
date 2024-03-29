import { ComponentType } from "../components/componentType";

export enum MessageType {
    JOIN,
    STATE,
    REQUEST_STATE,
    CHAT_MESSAGE,
    CREATE_COMPONENT,
    MOVE_COMPONENT,
    EDIT_COMPONENT,
    DELETE_COMPONENT,
    CREATE_CONNECTION,
    MOVE_CONNECTION,
    DELETE_CONNECTION,
}

export type Message = {
    type: MessageType;
    data: any;
    checksum?: string;
};

export function isMessage(message: any): message is Message {
    if (message.type === undefined) {
        return false;
    }
    if (message.data === undefined) {
        return false;
    }
    return true;
}

/**
 * Message types
 */

export type JoinMessage = {
    roomId: string;
};

export function isJoinMessage(message: any): message is JoinMessage {
    if (typeof message.roomId === "string") {
        return false;
    }

    return true;
}

export type StateMessage = {
    components: CreateMessage[];
    connections: CreateConnectionMessage[];
};

export type CreateMessage = {
    type: ComponentType;
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type CreateConnectionMessage = {
    type: ComponentType;
    id: string;
    startComponent: string;
    endComponent: string;
    startOffsetX: number;
    startOffsetY: number;
    endOffsetX: number;
    endOffsetY: number;
};

export type MoveMessage = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export type EditMessage = {
    id: string;
};

export type DeleteMessage = {
    id: string;
};
