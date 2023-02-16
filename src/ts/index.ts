export {};
const button = document.getElementById("button") as HTMLButtonElement;

button.addEventListener("click", function () {
    console.log("CLICK");

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

    const result = await response.json();
    window.location.href = `main.html#${result.sessionId}`;
}

/*

if (!response.ok) {
}

// If you care about a response:
if (response.body !== null) {
    // body is ReadableStream<Uint8Array>
    // parse as needed, e.g. reading directly, or
    const asString = new TextDecoder("utf-8").decode(response.body);
    // and further:
    const asJSON = JSON.parse(asString); // implicitly 'any', make sure to verify type on runtime.
}
*/
