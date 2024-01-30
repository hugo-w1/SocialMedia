//script for like and comment features
document.getElementById('like').addEventListener('click', async (e) => {
    e.preventDefault();


    let contentOwner = e.target.parentNode.parentNode.attributes.username.nodeValue;
    let contentId = e.target.parentNode.parentNode.attributes.postid.nodeValue;

    if (e.target.childNodes[1].attributes.liked.nodeValue == 'false') {
        document.getElementById('like_count').innerHTML++;
        e.target.childNodes[1].attributes.liked.nodeValue = 'true';
    } else {
        document.getElementById('like_count').innerHTML--;
        e.target.childNodes[1].attributes.liked.nodeValue = 'false';
    }


    await fetch(`./like`, {
        method: 'POST',
        body: JSON.stringify({
            'contentId': contentId,
            'contentOwner': contentOwner
        }),
    }).then(response => response.json()
    ).then(response => handleResponse(response));

});

function handleResponse(res) {
    console.log(res);
}

