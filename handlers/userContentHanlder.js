import fs from 'fs/promises';
import { templateNavbar } from '../templaters/navbar.js';
/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 * @param {string[]} pathSegments 
 * @param {*} result 
 */
export async function handleUserContent(req, res, db, pathSegments, result) {
    let contentId = pathSegments.shift();
    let content = '';

    result.posts.forEach(element => {
        //find post id
        if (contentId === element.id) {
            content = element;
            return;
        }
    });


    if (content == '') {
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
        userContentPage = userContentPage.replace('%username%', result.username);


        userContentPage = userContentPage.replace('%content_image%', `/${content.image}`);
        userContentPage = userContentPage.replace('%content_text%', content.text);

        let uploadedTime = new Date(content.time).toLocaleDateString("sv-SV");
        
        userContentPage = userContentPage.replace('%upload_time%', uploadedTime);



        let navbar = await templateNavbar(result);
        userContentPage = userContentPage.replace('%navbar%', navbar);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(userContentPage);
        res.end();
    }
}