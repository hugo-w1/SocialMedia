import fs from 'fs/promises';
import Cookies from 'cookies';
import { templateNavbar } from '../templaters/navbar.js';
import { handleFriendList } from './friendListHandler.js';
import { handleUserContent } from './userContentHanlder.js';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 * @param {string[]} pathSegments 
 * @param {*} result 
 */
export async function handleUserPath(req, res, db, pathSegments, result) {
    let cookies = new Cookies(req, res);
    let sessionId = cookies.get('sessionId');

    if (pathSegments.length === 0) {
        /*
        SHOW USER PROFILE
        */
        //get the logged in clients sessionID


        let clientDB = await db.collection('users').findOne({
            sessionId: sessionId
        });

        let posts = await db.collection('posts').find({
            username: result.username
        }).toArray();


        let content = (await fs.readFile('./templates/profile.html')).toString();

        //Add navbar
        let navbar = await templateNavbar(clientDB);
        content = content.replace('%navbar%', navbar);

        //template user profile
        content = content.replaceAll('%username%', result.username);
        content = content.replace('%profile_pic%', result.profile_pic);

        content = content.replace('%friends_amount%', `<a href="./${result.username}/friends">${result.friends.length}</a>`);
        content = content.replace('%friends%', `<a href="./${result.username}/friends">Friends</a>`);

        content = content.replace('%posts_amount%', posts.length);

        //users photosm
        let totalLikes = 0;
        if (posts.length > 0) {

            let postsContent = '';
            posts.forEach(element => {
                totalLikes += element.likes.length;
                postsContent += `<div><a href="/${element.username}/content/${element.id}"><img src="${element.image}" alt="user posted content"></a></div>`;
            });
            content = content.replace('%posts%', postsContent);

        } else {
            content = content.replace('%posts%', '');
        }
        content = content.replace('%likes%', totalLikes);


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
        case 'content':
            handleUserContent(req, res, db, pathSegments, result);
            break;
        default:
            //404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404, Not found');
            res.end();
            break;
    }

} 