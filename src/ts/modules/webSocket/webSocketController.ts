import { ChatController } from "../chat/chatController";
import { ComponentManager } from "../components/componentManager";
import { isMessage, Message, MessageType } from "./Message";

export class WebSocketController {
    public static instance: WebSocketController;

    private WebSocketUrl = "ws://127.0.0.1:3000";
    private socket: WebSocket;

    constructor(sessionId: string) {
        WebSocketController.instance = this;
        this.socket = new WebSocket(this.WebSocketUrl);

        this.socket.addEventListener("open", () => {
            console.log("Opened WebSocket connection");

            this.sent({
                type: MessageType.JOIN,
                data: sessionId,
            });
        });

        this.socket.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);

            let message: Message | undefined = undefined;
            try {
                message = JSON.parse(event.data);
            } catch (error) {}
            if (!isMessage(message)) return;

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

                default:
                    break;
            }
        });

        this.socket.addEventListener("close", () => {
            console.log("Closed WebSocket connection");
        });

        this.socket.addEventListener("error", () => {
            console.log("Error with the WebSocket connection");
        });
    }

    public sent(message: Message) {
        console.log(`sent msg`, message);

        this.socket.send(JSON.stringify(message));
    }
}
