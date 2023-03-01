import { Message, MessageType } from "../webSocket/Message";
import { WebSocketController } from "../webSocket/webSocketController";

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

        if (!this.chatForm || !this.chatInput || !this.chatToggle || !this.chat || !this.messages || !this.indicator)
            return;

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

            webSocketController.sent(message);
            this.newMessage(message);
        });
    }

    public newMessage(message: Message) {
        const messageContainer = document.createElement("div");
        messageContainer.classComponentName = "message-container";

        const messageText = document.createElement("p");
        messageText.classComponentName = "message-text";

        messageText.textContent = message.data;

        messageContainer.append(messageText);
        this.messages.append(messageContainer);

        if (this.chat.classList.contains("chat-hidden")) {
            this.indicator.classList.remove("chat-hidden");
        }
    }
}
