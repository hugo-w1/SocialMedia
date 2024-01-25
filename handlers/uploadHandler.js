import Cookies from "cookies";
import fs from 'fs/promises';
import { createWriteStream } from 'fs'
import busboy from 'busboy';
import os from 'os';
import path from 'path';

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

        } else if (req.method === 'POST') {

            const bb = busboy({ headers: req.headers });
            bb.on('file', (name, file, info) => {
                // destructuring the info object to get the filename, encoding and mimeType
                const { filename, encoding, mimeType } = info;
                console.log(
                    `File [${name}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}}`);

                // set the path to save the file

                /*Save in the socialmedia userupload fodler*/
                const saveTo = `./userUploads/${Date.now()}_${filename}`;

                console.log(`File [${name}] is saving to ${saveTo}`)

                // save the file
                file.pipe(createWriteStream(saveTo));

                file.on('data', (data) => {
                    console.log(`File [${name}] got ${data.length} bytes`);
                }).on('close', () => {
                    console.log(`File [${name}] done`);
                });
            });
            bb.on('field', (name, val, info) => {
                console.log(`Field [${name}]: value: `, val);
            });
            bb.on('close', () => {
                console.log('Done parsing form!');
                res.end('Done parsing form!');
            });

            // pipe the request to busboy to parse the form data
            req.pipe(bb);
            
        }
    }
}