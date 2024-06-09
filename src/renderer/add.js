const form = document.querySelector("#add");
form.addEventListener('submit', sendAddDataAndCloseWindow);

function sendAddDataAndCloseWindow(event) {
    event.preventDefault();
    const data = {
        name: form.querySelector('input[name="name"]').value,
        url: form.querySelector('input[name="url"]').value,
        mount: form.querySelector('input[name="mount"]').value,
    };
    window.electronAPI.sendAdd(data);
    window.close();
    return false;
}
