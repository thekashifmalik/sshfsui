window.electronAPI.onLoad(setMessage);

function setMessage(event, data) {
    const p = document.querySelector("#message");
    p.innerHTML = data;
}
