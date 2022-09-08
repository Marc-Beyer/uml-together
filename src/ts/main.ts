import { ClassComponent } from "./modules/components/classComponent";
import { Component } from "./modules/components/component";
import * as navigation from "./modules/navigation";

navigation.initialize();

for (let i = 0; i < 1; i++) {
    for (let j = 0; j < 1; j++) {
        new Component(i * 120, j * 120, 100, 100);
    }
}

new ClassComponent(-120, -120, 100, 100);

//new Component(0, 101, 100, 100);

const zoomSensibility = -0.001;
const container = document.getElementById("component-container");

if (!container) {
    throw new Error("component-container not found!");
}

container.addEventListener("wheel", (event) => {
    const zoom = zoomSensibility * event.deltaY;

    Component.addZoom(zoom, zoom);
});

let x: number = 0;
let y: number = 0;
let isMousedown = false;
container.addEventListener("mousedown", (event) => {
    x = event.screenX;
    y = event.screenY;
    isMousedown = true;

    if (!event.defaultPrevented) Component.resetActiveComponents();
});

container.addEventListener("mouseup", (event) => {
    isMousedown = false;
});

document.addEventListener("mousemove", (event) => {
    if (!isMousedown) return;
    if (Component.activeComponentList.length > 0) {
        for (let index = 0; index < Component.activeComponentList.length; index++) {
            const component = Component.activeComponentList[index];
            component.addPos(x - event.screenX, y - event.screenY);
            x = event.screenX;
            y = event.screenY;
        }
    } else {
        Component.addOffset(x - event.screenX, y - event.screenY);
        x = event.screenX;
        y = event.screenY;
    }
});
