import fs from 'fs/promises';
import Cookies from 'cookies';

import { templateNavbar } from '../templaters/navbar.js';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db // logged in user mongodb
 * @param {*} userDBFriendsList // The db of the friendlist
 */
export async function handleFriendList(req, res, db, pathSegments, userDBFriendsList) {
    if (req.method === 'GET') {

        var cookies = new Cookies(req, res);
        let sessionId = cookies.get('sessionId');

        let result = await db.collection('users').findOne({
            sessionId: sessionId
        });

        if (!result) {
            //Client not logged in, redirect to start page
            res.writeHead(302, {
                'Location': '../'
                //add other headers here.
            });
            res.end();
            return;
        } else {
            //client logged in. recived user info from database
            //./[USERNAME]/friends && logged in == true


            //navbar templating

            let content = (await fs.readFile('./templates/friendList.html')).toString();
            res.writeHead(200, { 'Content-Type': 'text/html' });
            //Add navbar
            let navbar = await templateNavbar(result);
            content = content.replace('%navbar%', navbar);


            //get searchParams
            let url = new URL(req.url, 'http://' + req.headers.host);
            let nameSearch = url.searchParams.get('name');

            let friends = userDBFriendsList.friends;

            if (friends.length == 0) {
                content = content.replace('%content%', `<h1>${userDBFriendsList.username} has no friends</h1>`);
            }
            if (nameSearch == null) {
                //return full friend list
                let friendsList = '';

                friends.forEach(element => {
                    friendsList += `<li class="list-group-item"><a href="../${element}">${element}</a></li>`;
                });
                content = content.replace('%content%', friendsList);

            } else {
                // search for nameSearch in friends array
                let searchResult = [];

                friends.forEach((list) => {
                    if (list.toLocaleLowerCase().search(nameSearch.toLocaleLowerCase()) > -1) {
                        searchResult.push(list)
                    }
                });

                let friendsList = '';


                searchResult.forEach(element => {
                    friendsList += `<li class="list-group-item"><a href="../${element}">${element}</a></li>`;
                });
                content = content.replace('%content%', friendsList);
            }

            res.write(content);
            res.end();
        }
    }
}
