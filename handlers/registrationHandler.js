import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import Cookies from 'cookies';
import bcrypt from 'bcrypt';
import { ReturnDocument } from 'mongodb';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 */
export async function handleRegistration(req, res, db) {
    if (req.method === 'GET') {
        let content = await fs.readFile('./templates/register.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(content);
        res.end();
    }
    if (req.method === 'POST') {
        let chunks = [];
        req.on('data', function (chunk) {
            chunks.push(chunk.toString());
        });

        req.on('end', async function () {
            let data = JSON.parse(chunks);

            let sessionId = randomUUID();
            let encryptedPassword = '';

            //Encrypt password [bcrypt]
            await bcrypt.hash(data.password, 10).then(function (hash) {
                encryptedPassword = hash;
            });

            let dataObj = {
                sessionId: sessionId,
                username: data.username,
                password: encryptedPassword,
                profile_pic: `https://ui-avatars.com/api/?name=${data.username}`
            };


            try {

                if (data.password.replace(/^\s+|\s+$/gm, '').length === 0) {
                    throw new Error('Password cannot be blank');
                }

                if (data.username.length === 0) {
                    throw new Error('Username cannot be blank');
                }

                await db.collection('users').insertOne(dataObj);

                //Set session cookie after successfull registraion
                let cookie = new Cookies(req, res);
                cookie.set('sessionId', sessionId);

                //__/profile/profileID
                //New user created
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({
                    'success': true,
                    'redirect': '/'
                }));
                res.end();
                return;
            } catch (err) {
                console.log(err);
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({
                    'success': false,
                    'error': `${err.message}`
                }));
                res.end();
            }
        });


    }
}