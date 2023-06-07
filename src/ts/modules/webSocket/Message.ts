import { ComponentType } from "../components/componentType";
import { ConnectionHead } from "../connections/connectionHead";
import { ConnectionLine } from "../connections/connectionLine";
import { ProgrammingLanguage } from "../settings/global";

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
    EDIT_CONNECTION,
    DELETE_CONNECTION,
    SETTINGS,
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

export type SettingsMessage = {
    FILE_NAME: string;
    PROGRAMMING_LANG: ProgrammingLanguage;
    xRaster: number;
    yRaster: number;
};

export type StateMessage = {
    components: CreateMessage[];
    connections: CreateConnectionMessage[];
    settings: SettingsMessage;
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
    id: string;
    startComponent: string;
    endComponent: string;
    startOffsetX: number;
    startOffsetY: number;
    endOffsetX: number;
    endOffsetY: number;
    startHead: ConnectionHead;
    endHead: ConnectionHead;
    line: ConnectionLine;
    startText?: string;
    middleText?: string;
    endText?: string;
    nodes?: { x: number; y: number }[];
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
