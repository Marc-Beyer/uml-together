import { ChatController } from "./modules/chat/chatController";
import { ComponentManager } from "./modules/components/componentManager";
import { ConnectionManager } from "./modules/connections/connectionManager";
import { initInput } from "./modules/input";
import { showLoading } from "./modules/modal/main";
import * as navigation from "./modules/navigation/main";
import { Global } from "./modules/settings/global";
import * as settings from "./modules/settings/settings";
import { WebSocketController } from "./modules/webSocket/webSocketController";

const mainUrl = import.meta.env.MODE === "development" ? "http://127.0.0.1" : "";

(async function main() {
    const href = window.location.href.replace("%23", "#").split("#");

    if (href.length >= 2) {
        const sessionId = href[1];
        const key = href[2];

        const response = await fetch(`${mainUrl}/session`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        if (!response.ok) return;

        const jsonResponse = await response.json();

        new ComponentManager();
        new ConnectionManager();
        new ChatController(new WebSocketController(jsonResponse.websocket, sessionId, key));

        init(sessionId, key);
    }
})();

function init(sessionId: string, key: string) {
    showLoading("Joining the Session...");

    navigation.initialize();
    settings.initSettings();
    Global.INIT(sessionId, key);

    initInput();

    window.addEventListener("beforeunload", function () {
        WebSocketController.instance.sentSaveMessage();
    });
}
