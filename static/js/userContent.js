//script for like and comment features
document.getElementById('like').addEventListener('click', async (e) => {
    e.preventDefault();


    let contentOwner = await e.target.parentNode.parentNode.attributes.username.nodeValue;
    let contentId = await e.target.parentNode.parentNode.attributes.postid.nodeValue;


    if (e.target.childNodes[1].childNodes[1].attributes.liked.nodeValue == 'false') {
        document.getElementById('like_count').innerHTML++;
        e.target.childNodes[1].childNodes[1].attributes.liked.nodeValue = 'true';
    } else {
        document.getElementById('like_count').innerHTML--;
        e.target.childNodes[1].childNodes[1].attributes.liked.nodeValue = 'false';
    }

    await fetch(`./like`, {
        method: 'POST',
        body: JSON.stringify({
            'contentId': contentId,
            'contentOwner': contentOwner
        }),
    }).then(response => response.json()
    ).then(response => handleResponse(response, 'like'));
});



document.getElementById('comment_btn').addEventListener('click', async (e) => {
    e.preventDefault();


    let contentId = document.getElementById('likebtn').attributes.postid.nodeValue;
    let comment = document.getElementById('text').value;

    if (comment.trim() == '') {
        alert('Comment cannot be empty');
        return;
    }

    await fetch(`./comment`, {
        method: 'POST',
        body: JSON.stringify({
            'contentId': contentId,
            'text': comment
        }),
    }).then(response => response.json()
    ).then(response => handleResponse(response, 'comment'));
});


function handleResponse(res, action) {
    console.log(res);
    if (action === 'comment') {
        location.reload();
    }
}

