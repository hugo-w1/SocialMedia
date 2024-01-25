import Cookies from "cookies";
import fs from 'fs/promises';
import { templateNavbar } from '../templaters/navbar.js';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 */
export async function handleUpload(req, res, db) {

    var cookies = new Cookies(req, res);
    let sessionId = cookies.get('sessionId');

    let result = await db.collection('users').findOne({
        sessionId: sessionId
    });

    //make sure someone is logged in
    if (!result) {
        //Client not logged in, redirect to start page
        res.writeHead(302, {
            'Location': '../'
        });
        res.end();
        return;
    } else {

        if (req.method == 'GET') {

            let content = (await fs.readFile('./templates/upload.html')).toString();

            //template navbar
            let navbar = await templateNavbar(result);
            content = content.replace('%navbar%', navbar);



            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(content);
            res.end();

        } else if (req.method == 'POST') {


        }
    }
}