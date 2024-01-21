var nodes = document.querySelectorAll('li > button');
for (var i = 0; i < nodes.length; i++) {
    nodes[i].addEventListener('click', async function (e) {
        sendRequest(e);
    });
}

async function sendRequest(e) {
    e.preventDefault();
    let method = '';

    //set method, remove or add friend
    if (e.target.innerHTML == 'Add friend') {
        method = 'add';
    }
    if (e.target.innerHTML == 'Remove friend') {
        method = 'remove';
    }

    //send data to server, post method
    await fetch(`/friendRequest/${method}`, {
        method: 'POST',
        body: JSON.stringify({
            affectedFriend: e.target.attributes.username.nodeValue
        }),
    }).then(
        response => response.json()
    ).then(
        response => handleResponse(response));
}


function handleResponse(response) {
    console.log(response);
    location.reload();
}
