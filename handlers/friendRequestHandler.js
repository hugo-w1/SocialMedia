import Cookies from 'cookies';

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 */

export async function handleFriendRequests(req, res, db, pathSegments) {
    if (req.method == 'POST') {
        var cookies = new Cookies(req, res);
        let sessionId = cookies.get('sessionId');

        let result = await db.collection('users').findOne({
            sessionId: sessionId
        });

        let seg = pathSegments.shift();
        if (seg == 'add') {
            //add new friend
            let chunks = [];
            req.on('data', function (chunk) {
                chunks.push(chunk);
            });
            req.on('end', async function () {
                let data = JSON.parse(chunks);

                //get the user that the person wants to add.
                let Adduser = await db.collection('users').findOne({
                    username: data.affectedFriend
                });

                try {
                    //Check if the added user exists
                    if (!Adduser) {
                        throw new Error('User does not exist');
                    }
                    else {
                        //check if client already has this friend
                        let friendlist = result.friends;
                        friendlist.forEach(element => {
                            if (element == data.affectedFriend) {
                                throw new Error('Cannot add same friend twice');
                            }
                        });

                        //add new friend to clients friend list

                        //get the logged in clients database
                        let query = { sessionId: sessionId };

                        friendlist.push(data.affectedFriend);

                        let newFriendsList = {
                            $set: { friends: friendlist }
                        };

                        //update the friend adders db.
                        db.collection("users").updateOne(query, newFriendsList);


                        //add a notification for the friend the user added.


                        let notificationQuery = { sessionId: Adduser.sessionId };

                        let notificationsList = Adduser.notifications;

                        let newNotification = {
                            'message': `${result.username} Added You As A Friend `,
                            'time': Date.now()
                        };

                        notificationsList.push(newNotification);

                        let newNotificationList = {
                            $set: { notifications: notificationsList }
                        };

                        //update database with new notification
                        db.collection("users").updateOne(notificationQuery, newNotificationList);
                    }

                } catch (err) {
                    console.log(err);
                    res.writeHead(501, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({
                        'success': false,
                        'error': 'Error'
                    }));
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({
                    'success': true,
                    'error': ''
                }));
                res.end();
                return;
            });
        } else if (seg == 'remove') {
            //remove friend
            let chunks = [];
            req.on('data', function (chunk) {
                chunks.push(chunk);
            });

            req.on('end', async function () {
                let data = JSON.parse(chunks);
                //remove friend

                try {
                    let friendlist = result.friends;
                    //filter out the affected person in the friendlist
                    friendlist = friendlist.filter(function (username) {
                        return username !== data.affectedFriend;
                    });

                    //get the logged in clients database
                    let query = { sessionId: sessionId };

                    let newFriendsList = {
                        $set: { friends: friendlist }
                    };

                    db.collection("users").updateOne(query, newFriendsList);

                }
                catch (err) {
                    console.log(err);
                    res.writeHead(501, { 'Content-Type': 'application/json' });
                    res.write(JSON.stringify({
                        'success': false,
                        'error': 'Error'
                    }));
                    res.end();
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({
                    'success': true,
                    'error': ''
                }));
                res.end();
                return;

            });

        }

    }
}