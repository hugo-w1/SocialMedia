import fs from 'fs/promises';
import Cookies from 'cookies';

import { templateNavbar } from '../templaters/navbar.js';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 */
export async function handleAddFriends(req, res, db) {
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

            //if error or other info, show this
            let searchInfo = '';

            //navbar templating

            let content = (await fs.readFile('./templates/addFriends.html')).toString();
            res.writeHead(200, { 'Content-Type': 'text/html' });
            //Add navbar + user info on navbar
            let navbar = await templateNavbar(result);
            content = content.replace('%navbar%', navbar);

            //get searchParams
            let url = new URL(req.url, 'http://' + req.headers.host);
            let nameSearch = url.searchParams.get('name');

            if (nameSearch == null) {

                //return list of suggested friends
                let friends = await db.collection('users').find({}).limit(20).toArray();

                //remove the logged in user from friendslist.
                friends = friends.filter(function (el) { return el.username != result.username; });

                //remove the logged in users friends from the list
                result.friends.forEach(element => {
                    friends = friends.filter(function (el) { return el.username != element; });
                });

                let friendsList = '';
                friends.forEach(element => {
                    friendsList += `<li class="list-group-item"><a href="../${element.username}">${element.username}</a> <button class="add_friend" username="${element.username}">Add friend</button></li>`;
                });
                content = content.replace('%content%', friendsList);

            } else {
                // search for nameSearch in mongodb
                let searchResult = await db.collection('users').find({ 'username': { '$regex': nameSearch } }).limit(40).toArray();

                //remove the logged in user from friendslist.
                searchResult = searchResult.filter(function (el) { return el.username != result.username; });

                //remove the logged in users friends from the list
                result.friends.forEach(element => {
                    searchResult = searchResult.filter(function (el) { return el.username != element; });
                });

                let friendsList = '';

                searchResult.forEach(element => {
                    friendsList += `<li class="list-group-item"><a href="../${element.username}">${element.username}</a> <button class="add_friend" username="${element.username}">Add friend</button></li>`;
                });

                if (searchResult.length == 0) {
                    searchInfo = '<h6>Nothing found</h6>';
                } else {
                    searchInfo = `<h6>Found ${searchResult.length} matches</h6>`;

                }
                content = content.replace('%content%', friendsList);
            }
            content = content.replace('%search_info%', searchInfo);


            res.write(content);
            res.end();
        }
    }
}