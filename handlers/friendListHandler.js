import fs from 'fs/promises';
import Cookies from 'cookies';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 */
export async function handleFriendList(req, res, db) {
    if (req.method === 'GET') {

        var cookies = new Cookies(req, res);
        let sessionId = cookies.get('sessionId');

        let result = await db.collection('users').findOne({
            sessionId: sessionId
        });

        if (!result) {
            //Client not logged in
            res.writeHead(302, {
                'Location': '../'
                //add other headers here...
            });
            res.end();
            return;

        } else {
            //client logged in. recived user info from database

            let content = await (await fs.readFile('./templates/friendList.html')).toString();
            res.writeHead(200, { 'Content-Type': 'text/html' });
            content = content.replace('%profile_picture%', result.profile_pic);

            content = content.replace('%logout%', `<form action="/logout" method="post">
            <input type="submit" value="Logout">
            </form>`);

            res.write(content);
            res.end();
        }
    }
}
