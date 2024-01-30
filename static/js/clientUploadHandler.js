document.getElementById('formFile').addEventListener('change', (e) => {
    console.log(e.target.files);
    document.getElementById('frame').src = URL.createObjectURL(e.target.files[0]);
});

document.getElementById('submit').onsubmit = (e) => {

    if (document.getElementById('frame').src = "") {
        alert('you have to upload an image');
        return false;
    }
}