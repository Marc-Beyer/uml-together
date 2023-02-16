import { ChatController } from "./modules/chat/chatController";
import { ClassComponent } from "./modules/components/classComponent";
import { Component } from "./modules/components/component";
import { ComponentManager } from "./modules/components/componentManager";
import { Connection } from "./modules/connections/connection";
import { initInput } from "./modules/input";
import * as navigation from "./modules/navigation/main";
import { Vector2 } from "./modules/vector2";
import { WebSocketController } from "./modules/webSocket/webSocketController";

const href = window.location.href.split("#");

if (href.length >= 2) {
    const sessionId = href[1];

    new ComponentManager();
    new ChatController(new WebSocketController(sessionId));

    init();
}

function init() {
    navigation.initialize();

    //const basicComponent = new Component(120, 120, 100, 100);
    //const classComponent = new ClassComponent(-120, -120);

    //new Connection(classComponent, basicComponent, new Vector2(0, 0), new Vector2(10, 100));

    initInput();
}
