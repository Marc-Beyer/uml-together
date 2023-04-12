import * as crypto from "crypto-js";

const mainUrl = import.meta.env.MODE === "development" ? "http://127.0.0.1" : "";

export {};
const button = document.getElementById("button") as HTMLButtonElement;

button.addEventListener("click", function () {
    requestNewSession();
});

async function requestNewSession() {
    const response = await fetch(`${mainUrl}/session`, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) return;

    const key = crypto.lib.WordArray.random(128 / 8);
    const hexKey = key.toString(crypto.enc.Hex);

    const result = await response.json();
    window.location.href = `/project#${result.sessionId}#${hexKey}`;
}
