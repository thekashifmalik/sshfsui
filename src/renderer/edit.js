const form = document.querySelector("#edit");
window.electronAPI.onLoad(setInitialData);

let initialName;

function setInitialData(event, data) {
    initialName = data.name;
    form.querySelector('input[name="name"]').value = data.name;
    form.querySelector('input[name="url"]').value = data.url;
    form.querySelector('input[name="mount"]').value = data.mount;
}

form.addEventListener('submit', sendEditDataAndCloseWindow);

function sendEditDataAndCloseWindow(event) {
    event.preventDefault();
    const data = {
        initialName,
        target: {
            name: form.querySelector('input[name="name"]').value,
            url: form.querySelector('input[name="url"]').value,
            mount: form.querySelector('input[name="mount"]').value,
        }
    };
    window.electronAPI.sendEdit(data);
    window.close();
    return false;
}
