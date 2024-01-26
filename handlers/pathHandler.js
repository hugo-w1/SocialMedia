import fs from 'fs/promises';
import Cookies from 'cookies';
import { handleRegistration } from "./registrationHandler.js";
import { handleLogin } from "./loginHandler.js";
import { handleLogout } from './logoutHandler.js';
import { handleStatic } from './staticHandler.js';
import { handleUserPath } from './userpathHandler.js';
import { templateNavbar } from '../templaters/navbar.js';
import { handleAddFriends } from './addFriendsHandler.js';
import { handleFriendRequests } from './friendRequestHandler.js';
import { handleNotification } from './notificationsHandler.js';
import { handleUpload } from './uploadHandler.js';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {string[]} pathSegments 
 */
export async function handlePath(req, res, pathSegments, db) {

    if (pathSegments.length === 0) {
        var cookies = new Cookies(req, res);
        let sessionId = cookies.get('sessionId');

        let result = await db.collection('users').findOne({
            sessionId: sessionId
        });


        //get home page
        let content = (await fs.readFile('./templates/index.html')).toString();


        //Add navbar
        let navbar = await templateNavbar(result);
        content = content.replace('%navbar%', navbar);


        if (!result) {
            //Client not logged in
            res.writeHead(200, { 'Content-Type': 'text/html' });
            content = content.replace('%content%', '<h1>Not logged in</h1> <br> <a href="/login">Login</a> <a href="/register">Register</a> ');
            res.write(content);
            res.end();
            return;
        } else {
            //Client logged in
            res.writeHead(200, { 'Content-Type': 'text/html' });
            content = content.replace('%content%', `
            <h1>Welcome ${result.username}</h1>
            <br>
            <p>Your encrypted password is ${result.password}</p>
            `);

            res.write(content);
            res.end();
            return;
        }
    }


    let seg = pathSegments.shift();
    switch (seg) {
        case 'register':
            handleRegistration(req, res, db);
            break;
        case 'login':
            handleLogin(req, res, db);
            break;
        case 'logout':
            handleLogout(req, res, db);
            break;
        case 'static':
            handleStatic(req, res, pathSegments);
            break;
        case 'add-friends':
            handleAddFriends(req, res, db);
            break;
        case 'friendRequest':
            handleFriendRequests(req, res, db, pathSegments);
            break;
        case 'notifications':
            handleNotification(req, res, db);
            break;
        case 'upload':
            handleUpload(req, res, db);
            break;
        default:
            //Locate UserPath
            let result = await db.collection('users').findOne({
                username: seg
            });
            if (!result) {
                //404
                res.writeHead(418, { 'Content-Type': 'text/plain' });
                res.write('404, Not found');
                res.end();
                break;
            } else {
                //Found user profile with path segment match.
                //Forward to userpathHandler.js
                handleUserPath(req, res, db, pathSegments, result);
            }
            break;
    }
}