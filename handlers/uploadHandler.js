import Cookies from "cookies";
import fs from 'fs/promises';
import { createWriteStream } from 'fs'
import busboy from 'busboy';
import { randomUUID } from 'crypto'

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
        if (req.method === 'GET') {
            let content = (await fs.readFile('./templates/upload.html')).toString();

            //template navbar
            let navbar = await templateNavbar(result);
            content = content.replace('%navbar%', navbar);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(content);
            res.end();

        } else if (req.method === 'POST') {


            let saveTo = '';
            let imageText = '';
            let saveFileName = '';
            let postId = '';
            let newPost = {};
            try {

                const bb = busboy({ headers: req.headers });

                bb.on('file', (name, file, info) => {
                    // destructuring the info object to get the filename, encoding and mimeType
                    const { filename, encoding, mimeType } = info;

                    if (mimeType != 'image/png' && mimeType != 'image/jpg' && mimeType != 'image/jpeg') {
                        throw new Error(`Invalid mime type: ${mimeType}`);
                    }


                    // set the path to save the file

                    //Save in the socialmedia userUploads fodler

                    //make filename a valid filename in windows
                    let tmpFilename = filename;
                    tmpFilename = tmpFilename.replace(/[ &\/\\#,+()$~%'":*?<>{}]/g, '');
                    console.log(tmpFilename);
                    saveFileName = `${Date.now()}_${tmpFilename.trim()}`;

                    saveTo = `./userUploads/${saveFileName}`;

                    //remove all invalid filename characters

                    // save the file
                    file.pipe(createWriteStream(saveTo));

                    file.on('close', () => {
                        console.log(`File [${name}] done`);
                    });
                });

                bb.on('field', (name, val, info) => {
                    console.log(`Field [${name}]: value: `, val);
                    imageText = val;
                });



                bb.on('close', async () => {

                    //include static path in saveTo, diffrent from the real save path.

                    saveTo = `static/userUploads/${saveFileName}`;
                    postId = randomUUID();


                    newPost = {
                        'username': result.username,
                        'id': postId,
                        'image': saveTo,
                        'text': imageText,
                        'time': Date.now(),
                        'comments': [],
                        'likes': [],
                    };


                    //save in mongodb
                    await db.collection('posts').insertOne(newPost);

                    //redirect to users post
                    res.writeHead(302, { 'Location': `/${result.username}/content/${postId}` });
                    res.end();
                });

                // pipe the request to busboy to parse the form data
                req.pipe(bb);

            } catch (error) {
                console.log(error);

                res.writeHead(501, { 'Content-Type': 'text/plain' });
                res.write('internal server error');
                res.end();
            }
        }
    }
}