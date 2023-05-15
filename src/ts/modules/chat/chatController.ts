import { Message, MessageType } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";

export enum DebugMessageType {
    INFO,
    WARNING,
    Error,
}

export class ChatController {
    public static instance: ChatController;

    private chatForm = document.getElementById("chat-form") as HTMLFormElement;
    private chatInput = document.getElementById("chat-input") as HTMLInputElement;
    private chatToggle = document.getElementById("chat-toggle") as HTMLButtonElement;
    private chat = document.getElementById("chat") as HTMLDivElement;
    private messages = document.getElementById("messages") as HTMLDivElement;
    private indicator = document.getElementById("msg-indicator") as HTMLSpanElement;

    constructor(webSocketController: WebSocketController) {
        ChatController.instance = this;

        if (!this.chatForm || !this.chatInput || !this.chatToggle || !this.chat || !this.messages || !this.indicator) return;

        this.chatToggle.addEventListener("click", () => {
            this.chat.classList.toggle("chat-hidden");
            this.indicator.classList.add("chat-hidden");
        });

        this.chatForm.addEventListener("submit", (event: SubmitEvent) => {
            event.preventDefault();

            let message: Message = {
                type: MessageType.CHAT_MESSAGE,
                data: this.chatInput.value,
            };
            this.chatInput.value = "";

            this.newMessage(message);
            webSocketController.sent(message);
        });
    }

    public newMessage(message: Message) {
        this.addMessageToHtml(message.data);
    }

    public newDebugMessage(text: string, messageType: DebugMessageType = DebugMessageType.INFO) {
        console.log(`${DebugMessageType[messageType]}: ${text}`);
        this.addMessageToHtml(`${DebugMessageType[messageType]}: ${text}`);

        this.chat.classList.remove("chat-hidden");
    }

    private addMessageToHtml(text: string) {
        const messageContainer = document.createElement("div");
        messageContainer.classList.add("message-container");

        const messageText = document.createElement("p");
        messageText.classList.add("message-text");

        messageText.textContent = text;

        messageContainer.append(messageText);
        this.messages.append(messageContainer);

        if (this.chat.classList.contains("chat-hidden")) {
            this.indicator.classList.remove("chat-hidden");
        }
    }
}
