import fs from 'fs/promises';
import Cookies from 'cookies';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 */
export async function handleLogin(req, res, db) {
    if (req.method === 'GET') {
        let content = await fs.readFile('./templates/login.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(content);
        res.end();
    }
    if (req.method === 'POST') {
        let chunks = [];
        req.on('data', function (chunk) {
            chunks.push(chunk);
        });

        req.on('end', async function () {
            let data = JSON.parse(chunks);

            try {
                let result = await db.collection('users').findOne({
                    username: data.username
                });

                //check password match
                bcrypt.compare(data.password, result.password).then(function (match) {
                    if (match) {

                        let newRandomSessionId = randomUUID();
                        let cookie = new Cookies(req, res);
                        let query = { username: data.username };

                        let newSessionId = { $set: { sessionId: newRandomSessionId } };

                        //update session cookie
                        cookie.set('sessionId', newRandomSessionId);

                        //update sessionId in mongoDB
                        db.collection("users").updateOne(query, newSessionId);


                        console.log('Logged in as ' + data.username + ' | loginHandler.js');
                        // /profile/profileID
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.write(JSON.stringify({
                            'success': true,
                            'redirect': `../${data.username}`
                        }));
                        res.end();
                    }
                    else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.write(JSON.stringify({
                            'success': false,
                            'error': 'Invalid Password'
                        }));
                        res.end();
                    }
                });
            } catch (err) {
                console.log(err);
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({
                    'success': false,
                    'error': 'Invalid Password'
                }));
                res.end();
            }
        });

    }
}
