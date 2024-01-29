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
            try {

                const bb = busboy({ headers: req.headers });

                bb.on('file', (name, file, info) => {
                    // destructuring the info object to get the filename, encoding and mimeType
                    const { filename, encoding, mimeType } = info;

                    if (mimeType != 'image/png' && mimeType != 'image/jpg' && mimeType != 'image/jpeg') {
                        throw new Error(`Invalid mime type: ${mimeType}`);
                    }

                    console.log(`File [${name}]: filename: ${filename}, encoding: ${encoding}, mimeType: ${mimeType}}`);

                    // set the path to save the file

                    //Save in the socialmedia userUploads fodler
                    saveFileName = `${Date.now()}_${filename}`;
                    saveTo = `./userUploads/${saveFileName}`;

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
                    imageText = val;
                });



                bb.on('close', () => {

                    let query = { sessionId: result.sessionId };

                    let posts = result.posts;

                    //include static path in saveTo, diffrent from the real save path.

                    saveTo = `static/userUploads/${saveFileName}`;
                    postId = randomUUID();


                    let newPost = {
                        'id': postId,
                        'image': saveTo,
                        'text': imageText,
                        'time': Date.now(),
                        'comments': [],
                        'likes': [],
                    };

                    posts.push(newPost);

                    let newPostsList = {
                        $set: { posts: posts }
                    };

                    //update database with new notification
                    db.collection("users").updateOne(query, newPostsList);

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
                res.end;

            }
        }
    }
}