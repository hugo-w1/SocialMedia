import fs from 'fs/promises';
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
        //show user profile
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(result.username + 's Profile');
        res.end();
        return;
    }
    let seg = pathSegments.shift();

    switch (seg) {
        case 'friends':
            handleFriendList(req, res, db, pathSegments, result);
            break;
        default:
            //404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404, Not found');
            res.end();
            break;
    }

} 