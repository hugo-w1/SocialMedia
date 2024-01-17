//client sided form validation
document.getElementById('login').addEventListener('click', async (e) => {
    e.preventDefault();
    //send data to server, post method
    await fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        }),
    }).then(
        response => response.json()
    ).then(
        response => handleResponse(response));
});



function handleResponse(response) {
    console.log(response);

    if (response.success) {
        window.location.href = response.redirect;
    } else {
        document.getElementById('password').classList.add('is-invalid');
        document.getElementById('password-feedback').innerHTML = response.error;
    }
    console.log(response.success);
    console.log(response.error);
}
