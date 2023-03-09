import * as crypto from "crypto-js";

export {};
const button = document.getElementById("button") as HTMLButtonElement;

button.addEventListener("click", function () {
    requestNewSession();
});

async function requestNewSession() {
    const response = await fetch("http://127.0.0.1:80/session", {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) return;

    const key = crypto.lib.WordArray.random(128 / 8);
    const hexKey = key.toString(crypto.enc.Hex);

    const result = await response.json();
    window.location.href = `main.html#${result.sessionId}#${hexKey}`;
}
