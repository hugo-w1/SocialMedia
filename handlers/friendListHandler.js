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

            let searchInfo = '';

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
                content = content.replace('%search_info%', `<h6>${userDBFriendsList.username} has no friends</h6>`);
            } else {
                searchInfo = `${friends.length} friends`;
            }

            if (nameSearch == null) {
                //return full friend list
                let friendsList = '';

                //make add/remove friends buttons for the logged in user
                friends.forEach(element => {
                    if (element == result.username) {
                        friendsList += `<li class="list-group-item"><a href="../${element}">${element}</a></li>`;
                        return;
                    }
                    if (result.friends.includes(element)) {
                        friendsList += `<li class="list-group-item"><a href="../${element}">${element}</a> <button class="remove_friend" username="${element}">Remove friend</button></li>`;
                    } else {
                        friendsList += `<li class="list-group-item"><a href="../${element}">${element}</a> <button class="add_friend" username="${element}">Add friend</button></li>`;
                    }
                });

                content = content.replace('%content%', friendsList);

                searchInfo = `${friends.length} friends`;

            } else {
                // search for nameSearch in friends array
                let searchResult = [];

                friends.forEach((list) => {
                    if (list.toLocaleLowerCase().search(nameSearch.toLocaleLowerCase()) > -1) {
                        searchResult.push(list)
                    }
                });

                let friendsList = '';


                //make add/remove friends buttons for the logged in user
                searchResult.forEach(element => {
                    if (element == result.username) {
                        friendsList += `<li class="list-group-item"><a href="../${element}">${element}</a></li>`;
                        return;
                    }
                    if (result.friends.includes(element)) {
                        friendsList += `<li class="list-group-item"><a href="../${element}">${element}</a> <button class="remove_friend" username="${element}">Remove friend</button></li>`;
                    } else {
                        friendsList += `<li class="list-group-item"><a href="../${element}">${element}</a> <button class="add_friend" username="${element}">Add friend</button></li>`;
                    }
                });

                content = content.replace('%content%', friendsList);
            }

            content = content.replace('%search_info%', searchInfo);
            res.write(content);
            res.end();
        }
    }
}
