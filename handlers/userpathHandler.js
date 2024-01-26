import fs from 'fs/promises';
import Cookies from 'cookies';
import { templateNavbar } from '../templaters/navbar.js';
import { handleFriendList } from './friendListHandler.js';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 * @param {string[]} pathSegments 
 * @param {*} result 
 */
export async function handleUserPath(req, res, db, pathSegments, result) {
    if (pathSegments.length === 0) {
        /*
        SHOW USER PROFILE
        */
        //get the logged in clients sessionID
        var cookies = new Cookies(req, res);
        let sessionId = cookies.get('sessionId');

        let clientDB = await db.collection('users').findOne({
            sessionId: sessionId
        });

        let content = (await fs.readFile('./templates/profile.html')).toString();

        //Add navbar
        let navbar = await templateNavbar(clientDB);
        content = content.replace('%navbar%', navbar);

        //template user profile
        content = content.replaceAll('%username%', result.username);
        content = content.replace('%profile_pic%', result.profile_pic);

        content = content.replace('%friends_amount%', `<a href="./${result.username}/friends">${result.friends.length}</a>`);
        content = content.replace('%friends%', `<a href="./${result.username}/friends">Friends</a>`);

        content = content.replace('%posts_amount%', result.posts.length);

        if (result.posts.length > 0) {
            let postsContent = '';
            result.posts.forEach(element => {
                postsContent += `<div><img src="${element.image}" alt="user posted content"></div>`;
            });
            content = content.replace('%posts%', postsContent);

        } else {
            content = content.replace('%posts%', '');
        }



        try {
            if (clientDB.username != result.username) {
                //check if client has the user added as a friend

                if (clientDB.friends.includes(result.username)) {
                    content = content.replace('%user_buttons%', `<ul class="buttons">
                <li><button username="${result.username}" class="btn btn-sm btn-danger w-100 ml-2">Remove Friend</button></li>
               </ul>`);
                } else {
                    content = content.replace('%user_buttons%', `<ul class="buttons">
                <li><button username="${result.username}" class="btn btn-sm btn-success w-100 ml-2">Add Friend</button></li>
               </ul>`);
                }
            } else {
                //  user viewing his own profile
                content = content.replace('%user_buttons%', 'Edit profile');
            }

        } catch (err) {
            content = content.replace('%user_buttons%', '');
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(content);
        res.end();
        return;
    }

    let seg = pathSegments.shift();

    switch (seg) {
        case 'friends':
            handleFriendList(req, res, db, pathSegments, result);
            break;
        case 'post':
            break;
        default:
            //404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404, Not found');
            res.end();
            break;
    }

} 