import fs from 'fs/promises';
import Cookies from 'cookies';
import { handleRegistration } from "./registrationHandler.js";
import { handleLogin } from "./loginHandler.js";
import { handleLogout } from './logoutHandler.js';
import { handleStatic } from './staticHandler.js';
import { handleFriendList } from './friendListHandler.js';

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

            content = content.replace('%profile_picture%', result.profile_pic);

            content = content.replace('%logout%', `<form action="/logout" method="post">
            <input type="submit" value="Logout">
            </form>`);

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
        case 'friends':
            handleFriendList(req, res, db);
            break;
        default:
            //404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404, Not found');
            res.end();
            break;
    }
}