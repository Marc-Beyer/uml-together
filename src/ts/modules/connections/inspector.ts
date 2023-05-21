import { Grid } from "../grid";
import { Connection } from "./connection";
import { ConnectionHead } from "./connectionHead";
import { ConnectionLine } from "./connectionLine";

export function fillInspector(connection: Connection) {
    const inspector = document.getElementById("inspector-container");
    if (inspector) {
        inspector.classList.remove("hidden");
        inspector.innerHTML = "";

        // Heading 1
        const inspectorHeading = document.createElement("h2");
        inspectorHeading.textContent = "Connection Settings";
        inspector.append(inspectorHeading);

        // Start Text
        const startTextOption = createTextOption("Start Text", connection.startText, (value: string) => {
            connection.startText = value;
            Grid.addOffset(0, 0);
            connection.sendEditMessage();
        });
        inspector.append(startTextOption);

        // Middle Text
        const middleTextOption = createTextOption("Middle Text", connection.middleText, (value: string) => {
            connection.middleText = value;
            Grid.addOffset(0, 0);
            connection.sendEditMessage();
        });
        inspector.append(middleTextOption);

        // End Text
        const endTextOption = createTextOption("End Text", connection.endText, (value: string) => {
            connection.endText = value;
            Grid.addOffset(0, 0);
            connection.sendEditMessage();
        });
        inspector.append(endTextOption);

        // Heading 2
        const inspectorHeading2 = document.createElement("h2");
        inspectorHeading2.textContent = "Connection Style";
        inspector.append(inspectorHeading2);

        // Start Head
        const startHeadOption = createHeadDropDownOption("Line Start Cap", connection.startHead, (value: string) => {
            connection.startHead = Number(value);
            Grid.addOffset(0, 0);
            connection.sendEditMessage();
        });
        inspector.append(startHeadOption);

        // End Head
        const lineOption = createLineDropDownOption("Line Style", connection.line, (value: string) => {
            connection.line = Number(value);
            Grid.addOffset(0, 0);
            connection.sendEditMessage();
        });
        inspector.append(lineOption);

        // End Head
        const endHeadOption = createHeadDropDownOption("Line End Cap", connection.endHead, (value: string) => {
            connection.endHead = Number(value);
            Grid.addOffset(0, 0);
            connection.sendEditMessage();
        });
        inspector.append(endHeadOption);
    }
}

function createTextOption(labelText: string, curValue: string, callback: (value: string) => void) {
    const id = `${labelText.replaceAll(/ /g, "_")}Input`;

    const optionContainer = document.createElement("div");
    optionContainer.classList.add("option-container");

    const textLabel = document.createElement("label");
    textLabel.textContent = labelText;
    textLabel.htmlFor = id;

    const textInput = document.createElement("input");
    textInput.value = curValue;
    textInput.id = id;
    textInput.addEventListener("change", () => {
        callback(textInput.value);
    });

    optionContainer.append(textLabel);
    optionContainer.append(textInput);

    return optionContainer;
}

function createLineDropDownOption(labelText: string, curValue: ConnectionLine, callback: (value: string) => void) {
    const id = `${labelText.replaceAll(/ /g, "_")}Input`;

    const optionContainer = document.createElement("div");
    optionContainer.classList.add("option-container");

    const textLabel = document.createElement("label");
    textLabel.textContent = labelText;
    textLabel.htmlFor = id;

    const select = document.createElement("select");
    select.id = id;
    select.addEventListener("change", () => {
        callback(select.value);
    });

    for (const key in ConnectionLine) {
        if (!Number.isNaN(Number(key)) && Object.prototype.hasOwnProperty.call(ConnectionLine, key)) {
            select.append(createOption(key, ConnectionLine[key] ?? ""));
        }
    }

    select.value = curValue.toString();

    optionContainer.append(textLabel);
    optionContainer.append(select);

    return optionContainer;
}

function createHeadDropDownOption(labelText: string, curValue: ConnectionHead, callback: (value: string) => void) {
    const id = `${labelText.replaceAll(/ /g, "_")}Input`;

    const optionContainer = document.createElement("div");
    optionContainer.classList.add("option-container");

    const textLabel = document.createElement("label");
    textLabel.textContent = labelText;
    textLabel.htmlFor = id;

    const select = document.createElement("select");
    select.id = id;
    select.addEventListener("change", () => {
        callback(select.value);
    });

    for (const key in ConnectionHead) {
        if (!Number.isNaN(Number(key)) && Object.prototype.hasOwnProperty.call(ConnectionHead, key)) {
            select.append(createOption(key, ConnectionHead[key]));
        }
    }
    select.value = curValue.toString();

    optionContainer.append(textLabel);
    optionContainer.append(select);

    return optionContainer;
}

function createOption(value: string, text: string) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;

    return option;
}
