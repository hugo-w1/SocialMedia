import fs from 'fs/promises';
import Cookies from 'cookies';
import { templateNavbar } from '../templaters/navbar.js';
import { handleContentInteraction } from './contentInteractionHandler.js';
/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 * @param {string[]} pathSegments 
 * @param {*} result 
 */
export async function handleUserContent(req, res, db, pathSegments, result) {
    if (req.method === 'GET') {
        let contentId = pathSegments.shift();

        let cookies = new Cookies(req, res);
        let sessionId = cookies.get('sessionId');

        let clientDB = await db.collection('users').findOne({
            sessionId: sessionId
        });


        let content = await db.collection('posts').findOne({
            id: contentId
        });

        if (!content) {
            //404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404, Not Found');
            res.end();
            return;
        } else {

            let userContentPage = (await fs.readFile('./templates/userContent.html')).toString();

            userContentPage = userContentPage.replace('%title%', `${result.username}'s content`);
            userContentPage = userContentPage.replace('%profile_pic%', result.profile_pic);
            userContentPage = userContentPage.replaceAll('%userProfile%', `/${result.username}`);
            userContentPage = userContentPage.replaceAll('%username%', result.username);
            userContentPage = userContentPage.replace('%postid%', content.id);
            userContentPage = userContentPage.replace('%likes_amount%', content.likes.length);


            //check if user has liked this post
            console.log(clientDB.username);
            if (content.likes.includes(clientDB.username)) {
                userContentPage = userContentPage.replace('%user_liked%', 'true');
            } else {
                userContentPage = userContentPage.replace('%user_liked%', 'false');
            }

            userContentPage = userContentPage.replace('%content_image%', `/${content.image}`);
            userContentPage = userContentPage.replace('%content_text%', content.text);

            let uploadedTime = new Date(content.time).toLocaleDateString("sv-SV");

            userContentPage = userContentPage.replace('%upload_time%', uploadedTime);



            let navbar = await templateNavbar(clientDB);
            userContentPage = userContentPage.replace('%navbar%', navbar);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(userContentPage);
            res.end();
        }
    } else if (req.method === 'POST') {
        let action = pathSegments.shift();

        //Get post data
        let chunks = [];
        req.on('data', function (chunk) {
            chunks.push(chunk);
        });
        req.on('end', async function () {
            let contentData = JSON.parse(chunks);

            switch (action) {
                case 'like':
                    console.log('like');
                    handleContentInteraction(req, res, db, action, contentData);
                    break;
                case 'comment':
                    console.log('comment');
                    break;
                default:
                    res.writeHead(501, { 'Content-Type': 'text/plain' });
                    res.write('501, Server Error');
                    res.end();
                    break;
            }
        });
    }
}