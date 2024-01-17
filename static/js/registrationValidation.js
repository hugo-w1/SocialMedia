//client sided form validation
document.getElementById('register').addEventListener('click', async (e) => {
    e.preventDefault();

    if (document.getElementById('password').value !== document.getElementById('password2').value) {
        return;
    }

    //send data to server, post method
    await fetch('/register', {
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

document.getElementById('password2').addEventListener('change', (e) => {
    if (e.target.value !== document.getElementById('password').value || document.getElementById('password').value == '') {
        e.target.classList.add('is-invalid');
        document.getElementById('password').classList.add('is-invalid');
        document.getElementById('password2-feedback').innerHTML = "Passwords does not match";
    } else if (e.target.value === document.getElementById('password').value || e.target.value != '') {
        document.getElementById('password').classList.remove('is-invalid');
        e.target.classList.remove('is-invalid');

        document.getElementById('password').classList.add('is-valid');
        e.target.classList.add('is-valid');

        e.target.classList.add('is-valid');
        document.getElementById('password').classList.add('is-valid');
    }
})

function handleResponse(response) {
    console.log(response);

    if (response.success) {
        window.location.href = response.redirect;
    } else {
        if (response.error.split(' ')[0] == 'E11000') {
            document.getElementById('username').classList.add('is-invalid');
            document.getElementById('username-feedback').innerHTML = "Username Taken";
        } else if (response.error.split(' ')[0] == 'Password') {
            document.getElementById('password').classList.add('is-invalid');
            //is-invalid & is-valid
            //https://designmodo.com/validate-forms-bootstrap/
            document.getElementById('password-feedback').innerHTML = "Password cannot be blank";
        } else {
            document.getElementById('password').classList.remove('is-invalid');
            document.getElementById('password2').classList.remove('is-invalid');

            document.getElementById('password').classList.add('is-valid');
            document.getElementById('password2').classList.add('is-valid');
            document.getElementById('password-feedback').innerHTML = null;

            alert(response.error);
        }
        console.log(response.success);
        console.log(response.error);
    }
}