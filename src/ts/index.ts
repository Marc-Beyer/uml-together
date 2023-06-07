import * as crypto from "crypto-js";

const mainUrl = import.meta.env.MODE === "development" ? "http://127.0.0.1" : "";

export {};
const button = document.getElementById("button") as HTMLButtonElement;

button.addEventListener("click", function () {
    requestNewSession();
});

const storedSessions = document.getElementById("stored-sessions");
for (let index = 0; index < localStorage.length; index++) {
    const sessionId = localStorage.key(index);
    if (sessionId === null) continue;
    const storedString = localStorage.getItem(sessionId);
    if (storedString === null) continue;
    const stored = JSON.parse(storedString);

    const a = document.createElement("a");
    a.textContent = `${stored.FILE_NAME ? stored.FILE_NAME : sessionId}`;

    a.href = `/project#${sessionId}#${stored.KEY}`;

    storedSessions?.append(a);
}
if (storedSessions && localStorage.length > 0) {
    storedSessions.style.display = "flex";
}

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
