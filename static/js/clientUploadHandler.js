document.getElementById('formFile').addEventListener('change', (e) => {
    document.getElementById('frame').src = URL.createObjectURL(e.target.files[0]);
});

document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    let formData = new FormData(e.target);

    await fetch('/upload', {
        method: 'POST',
        body: formData
    }).then(respone => respone.json())
        .then(respone => handleResponse(respone))
        .catch(err => console.log(err));
});

function handleResponse(res) {
    if (res.Location) {
        window.location.replace(res.Location);
    } else {
        alert(res.Error);
    }
}