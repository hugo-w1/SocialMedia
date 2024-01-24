import fs from 'fs/promises';

export async function templateNotifications(result) {

    let notifications = (await fs.readFile('./templates/notifications.html')).toString();

    if (result.notifications.length > 0) {

        notifications.replace('%amount%', `<span class="badge rounded-pill badge-notification bg-danger">${result.notifications.length}</span>`);
        let content = '';

        result.notifications.forEach(element => {
            content += `<article class="content">
        <div class="notification-item">
            <h4 class="item-title">${element.message}</h4>
            <p class="item-info"><a href="">View Profile</a></p>
            <p>&#x2022; ${time2TimeAgo(element.time)}</p>
        </div>
    </article>`;
        });

        notifications.replace('%notifications_content%', content);

    } else {
        notifications.replace('%amount%', '');
        notifications.replace('%notifications_content%', '');
    }

    return notifications;
}


function time2TimeAgo(ts) {

    var d = new Date();  // Gets the current time
    var nowTs = Math.floor(d.getTime() / 1000);
    var seconds = nowTs - ts;

    if (seconds > 2 * 24 * 3600) {
        return "a few days ago";
    }
    // a day
    if (seconds > 24 * 3600) {
        return "yesterday";
    }

    if (seconds > 3600) {
        return "a few hours ago";
    }
    if (seconds > 1800) {
        return "Half an hour ago";
    }
    if (seconds > 60) {
        return Math.floor(seconds / 60) + " minutes ago";
    }
    if (seconds > 0) {
        return 'Just Now';
    }
}