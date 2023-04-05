export {};

const joinButton = document.getElementById("join-btn") as HTMLButtonElement;
const sessionInput = document.getElementById("session-input") as HTMLInputElement;
const sessionError = document.getElementById("session-error") as HTMLSpanElement;

joinButton.addEventListener("click", () => {
    // Focus the session input if it is empty
    if (sessionInput.value.trim() === "") {
        sessionInput.focus();
        return;
    }

    const splitSession = sessionInput.value.split("#");
    let sessionId = "";
    let hexKey = "";

    // Split the input into session id and hexKey
    switch (splitSession.length) {
        case 3:
            sessionId = splitSession[1];
            hexKey = splitSession[2];
            break;
        case 2:
            sessionId = splitSession[0];
            hexKey = splitSession[1];
            break;
        case 1:
            sessionId = splitSession[0];
            break;

        default:
            // Show error feedback
            sessionError.style.display = "block";
            sessionInput.classList.add("error");
            sessionInput.focus();
            return;
            break;
    }

    // Redirect to the session
    window.location.href = `../project#${sessionId}#${hexKey}`;
});
