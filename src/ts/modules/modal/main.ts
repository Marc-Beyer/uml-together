// Get modal elements
const modal = document.getElementById("modal") as HTMLDialogElement;
const modalName = document.getElementById("modal-name");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalContent = document.getElementById("modal-content");
let modalPrimaryBtn = document.getElementById("modal-primary-btn");
let modalSecondaryBtn = document.getElementById("modal-secondary-btn");

modalCloseBtn?.addEventListener("click", () => {
    modal?.close();
});

// Reset the modal by removing all event listeners from the primary / secondary buttons and deleting all modal contents.
function resetModal() {
    if (!modal || !modalName || !modalContent || !modalPrimaryBtn || !modalSecondaryBtn) return;

    // Delete all contents
    modalContent.innerHTML = "";

    // Clone the buttons to remove all event listener
    const newModalPrimaryBtn = modalPrimaryBtn.cloneNode(true) as HTMLElement;
    const newModalSecondaryBtn = modalSecondaryBtn.cloneNode(true) as HTMLElement;
    modalPrimaryBtn.replaceWith(newModalPrimaryBtn);
    modalSecondaryBtn.replaceWith(newModalSecondaryBtn);
    modalPrimaryBtn = newModalPrimaryBtn;
    modalSecondaryBtn = newModalSecondaryBtn;
    modalSecondaryBtn.classList.add("secondary-btn");
    modalPrimaryBtn.style.display = "";
    modalSecondaryBtn.style.display = "";
}

export function closeModal() {
    modal?.close();
}

// Show a loading modal.
export function showLoading(text = "Loading...") {
    if (!modal || !modalName || !modalContent || !modalPrimaryBtn || !modalSecondaryBtn) return;

    modalName.textContent = text;

    resetModal();

    let loading = document.createElement("div");
    loading.classList.add("loading");
    modalContent.append(loading);

    modalPrimaryBtn.style.display = "none";
    modalSecondaryBtn.style.display = "none";

    modal.showModal();
}

// Show a message modal.
export function showModal(text: string, message = "") {
    if (!modal || !modalName || !modalContent || !modalPrimaryBtn || !modalSecondaryBtn) return;

    modalName.textContent = text;

    resetModal();

    let paragraph = document.createElement("p");
    paragraph.textContent = message;
    modalContent.append(paragraph);

    modalPrimaryBtn.textContent = "OK";
    modalPrimaryBtn.style.display = "";
    modalSecondaryBtn.style.display = "none";

    modalPrimaryBtn.addEventListener("click", () => {
        modal.close();
    });

    modal.showModal();
}

// Show the modal and display the error message and a reload page option
export function showErrorWithReload(errorMsg: string) {
    if (!modal || !modalName || !modalContent || !modalPrimaryBtn || !modalSecondaryBtn) return;

    modalName.textContent = `An Error Occurred!`;

    resetModal();

    modalPrimaryBtn.textContent = "Reload";
    modalContent.append(document.createTextNode(errorMsg));

    modalPrimaryBtn.addEventListener("click", () => {
        location.reload();
    });

    modalSecondaryBtn.style.display = "none";

    modal.showModal();
}

// Show the modal and display the error message
export function showError(errorText: string) {
    if (!modal || !modalName || !modalContent || !modalPrimaryBtn || !modalSecondaryBtn) return;

    modalName.textContent = `⚠️ An Error Occurred!`;

    resetModal();

    modalPrimaryBtn.textContent = "OK";
    modalContent.append(document.createTextNode(errorText));

    modalPrimaryBtn.addEventListener("click", () => {
        modal.close();
    });
    modalSecondaryBtn.style.display = "none";

    modal.showModal();
}
