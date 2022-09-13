import { ClassComponent } from "./modules/components/classComponent";
import { Component } from "./modules/components/component";
import { initInput } from "./modules/input";
import * as navigation from "./modules/navigation/main";

navigation.initialize();

for (let i = 0; i < 1; i++) {
    for (let j = 0; j < 1; j++) {
        new Component(i * 120, j * 120, 100, 100);
    }
}

new ClassComponent(-120, -120);

//new Component(0, 101, 100, 100);

initInput();
