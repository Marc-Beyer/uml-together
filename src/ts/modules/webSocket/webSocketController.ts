import { ChatController } from "../chat/chatController";
import { ComponentManager } from "../components/componentManager";
import { isMessage, Message, MessageType } from "./Message";
import * as crypto from "crypto-js";
import { Global } from "../settings/global";
import { ConnectionManager } from "../connections/connectionManager";
import { closeModal, showError, showErrorWithReload } from "../modal/main";

export class WebSocketController {
    public static instance: WebSocketController;

    private socket: WebSocket;
    private key: string;

    private isJoining = true;

    constructor(wsUrl: string, sessionId: string, key: string) {
        WebSocketController.instance = this;
        this.socket = new WebSocket(wsUrl);
        this.key = key;

        this.socket.addEventListener("open", () => {
            console.log("Opened WebSocket connection");

            this.sent({
                type: MessageType.JOIN,
                data: sessionId,
            });
        });

        this.socket.addEventListener("message", (event) => {
            console.log("Message from server", event.data);

            let message: Message | undefined = undefined;
            try {
                message = JSON.parse(event.data);
            } catch (error) {}
            if (!isMessage(message)) return;

            console.log("new message", message);

            if (Global.USE_ENCRYPTION) {
                try {
                    const bytes = crypto.AES.decrypt(message.data, this.key);
                    message.data = JSON.parse(bytes.toString(crypto.enc.Utf8));
                } catch (error) {}
            }

            console.log("decrypted message", MessageType[message.type], message);

            if (this.isJoining) {
                closeModal();
            }

            switch (message.type) {
                case MessageType.CHAT_MESSAGE:
                    ChatController.instance.newMessage(message);
                    break;

                case MessageType.CREATE_COMPONENT:
                    ComponentManager.instance.onCreateMessage(message.data);
                    break;

                case MessageType.MOVE_COMPONENT:
                    ComponentManager.instance.onMoveMessage(message.data);
                    break;

                case MessageType.EDIT_COMPONENT:
                    ComponentManager.instance.onEditMessage(message.data);
                    break;

                case MessageType.DELETE_COMPONENT:
                    ComponentManager.instance.onDeleteMessage(message.data);
                    break;

                case MessageType.REQUEST_STATE:
                    const data = this.getStateData();

                    WebSocketController.instance.sent({
                        type: MessageType.STATE,
                        data,
                        checksum: crypto.SHA3(JSON.stringify(data)).toString(),
                    });
                    break;

                case MessageType.STATE:
                    ComponentManager.instance.onStateMessage(message.data);
                    ConnectionManager.instance.onStateMessage(message.data);
                    break;

                case MessageType.CREATE_CONNECTION:
                    ConnectionManager.instance.onCreateMessage(message.data);
                    break;

                case MessageType.EDIT_CONNECTION:
                    ConnectionManager.instance.onEditMessage(message.data);
                    break;
                case MessageType.DELETE_CONNECTION:
                    ConnectionManager.instance.onDeleteMessage(message.data);
                    break;
                default:
                    break;
            }
        });

        this.socket.addEventListener("close", () => {
            console.log("Closed WebSocket connection");

            closeModal();
            showError("The connection to the server failed!");
        });

        this.socket.addEventListener("error", () => {
            console.log("Error with the WebSocket connection");

            closeModal();
            showErrorWithReload("The connection to the server failed!");
        });
    }

    public sentSaveMessage() {
        const data = this.getStateData();

        this.sent({
            type: MessageType.REQUEST_STATE,
            data,
            checksum: crypto.SHA3(JSON.stringify(data)).toString(),
        });
    }

    public sent(message: Message) {
        console.log(`Sent ${MessageType[message.type]}-message`);

        if (message.type !== MessageType.JOIN && Global.USE_ENCRYPTION) {
            message.data = crypto.AES.encrypt(JSON.stringify(message.data), this.key).toString();
        }

        this.socket.send(JSON.stringify(message));
    }

    private getStateData() {
        const components = ComponentManager.instance.getState();
        const connections = ConnectionManager.instance.getState();

        const data = {
            components,
            connections,
        };
        return data;
    }
}
