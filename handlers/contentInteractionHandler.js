import Cookies from "cookies";
/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 * @param {string} action 
 * @param {JSON} contentData 
 */
export async function handleContentInteraction(req, res, db, action, contentData) {
    var cookies = new Cookies(req, res);
    let sessionId = cookies.get('sessionId');

    let result = await db.collection('users').findOne({
        sessionId: sessionId
    });
    //noone logged in
    if (!result) {
        res.end();
        return;
    } else {
        //find post
        let content = await db.collection('posts').findOne({
            id: contentData.contentId
        });

        if (action === 'like') {
            if (content.likes.includes(result.username)) {

                let likesQuery = { id: contentData.contentId };

                let newLikes = content.likes;

                newLikes = newLikes.filter(function (username) {
                    return username !== result.username;
                });


                let newLikesList = {
                    $set: { likes: newLikes }
                };

                db.collection('posts').updateOne(likesQuery, newLikesList);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ 'success': true }));
                res.end();


            } else {
                let likesQuery = { id: contentData.contentId };

                let likesArray = content.likes;

                likesArray.push(result.username);


                let newLikesList = {
                    $set: { likes: likesArray }
                };

                //update database with new notification
                db.collection('posts').updateOne(likesQuery, newLikesList);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ 'success': true }));
                res.end();

            }



        } else if (action === 'comment') {

        }
    }

}