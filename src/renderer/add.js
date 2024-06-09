const submit = document.querySelector("#add");
console.log(submit);
submit.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
        name: submit.querySelector('input[name="name"]').value,
        url: submit.querySelector('input[name="url"]').value,
        mount: submit.querySelector('input[name="mount"]').value,
    };
    console.log(data);
    window.electronAPI.sendAdd(data);
    window.close();
    return false;
})
