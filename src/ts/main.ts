import { ChatController } from "./modules/chat/chatController";
import { ComponentManager } from "./modules/components/componentManager";
import { ConnectionManager } from "./modules/connections/connectionManager";
import { initInput } from "./modules/input";
import * as navigation from "./modules/navigation/main";
import * as settings from "./modules/settings/settings";
import { WebSocketController } from "./modules/webSocket/webSocketController";

const href = window.location.href.split("#");

if (href.length >= 2) {
    const sessionId = href[1];
    const key = href[2];

    new ComponentManager();
    new ConnectionManager();
    new ChatController(new WebSocketController(sessionId, key));

    init();
}

function init() {
    navigation.initialize();
    settings.initSettings();

    //const basicComponent = new Component(120, 120, 100, 100);
    //const classComponent = new ClassComponent(-120, -120);

    //new Connection(classComponent, basicComponent, new Vector2(0, 0), new Vector2(10, 100));

    initInput();
}
