import fs from 'fs/promises';
import { templateNotifications } from './notifications.js';

export async function templateNavbar(result) {
    let navbar = (await fs.readFile('./templates/navbar.html')).toString();

    if (!result) {
        //not logged in
        navbar = navbar.replace('%navbar_buttons%', '');
        navbar = navbar.replace('%navbar_profile%', '');
        navbar = navbar.replace('%notifications%', '');

        return navbar;
    } else {
        //Client logged in
        navbar = navbar.replace('%navbar_buttons%', `
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/${result.username}/friends">Friends</a>
            </li>
            <li class="nav-item">
            <a class="nav-link" href="/upload">Upload</a>
        </li>
        </ul>`);

        navbar = navbar.replace('%navbar_profile%', `<div class="d-flex">
        <div class="container">
            <div class="dropdown">
                <img class="btn dropdown-toggle profile-pic" src="${result.profile_pic}"
                    alt="dropdown profile picture" data-bs-toggle="dropdown" class="img-responsive">
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a href="/${result.username}">Profile</a></li>
                        <li><form action="/logout" method="post">
                        <input type="submit" value="Logout">
                        </form></li>
                    </ul>
            </div>
        </div>
    </div>`);

        let notificationsBell = await templateNotifications(result);

        navbar = navbar.replace('%notifications%', notificationsBell);

        return navbar;
    }
}