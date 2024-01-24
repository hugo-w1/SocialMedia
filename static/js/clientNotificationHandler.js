document.querySelectorAll('ul > div > h4').forEach(element => {
    element.addEventListener('click', async function (e) {
        e.preventDefault();

        await fetch(`/notifications`, {
            method: 'POST',
            body: JSON.stringify({
                notificaions: 'all'
            }),
        }).then(
            response => response.json()
        ).then(location.reload());
    });
});

