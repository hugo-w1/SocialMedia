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

    //not working

    //get the logged in users db
    let result = await db.collection('users').findOne({
        sessionId: sessionId
    });
    //noone logged in
    if (result == '') {
        res.end();
        return;
    }

    let contentOwnerDB = await db.collection('users').findOne({
        username: contentData.contentOwner
    });

    let content = '';
    contentOwnerDB.posts.forEach(element => {
        //find the post
        if (contentData.contentId === element.id) {
            content = element;
            return;
        }
    });

    if (action === 'like') {

        let likes = content.likes;

        //check if user already likes this post, if so remove the like.
        try {

            if (likes.includes(result.username)) {

                let query = { sessionId: contentOwnerDB.sessionId };

                likes.push(result.username);

                let newLikesList = {
                    $set: { likes: likes }
                };

                //update the friend adders db.
                db.collection("users").updateOne(query, newLikesList);
            } else {

                //filter out the person who removed his like
                likes = likes.filter(function (username) {
                    return username !== result.username;
                });

                //get the posters database
                let query = { sessionId: contentOwnerDB.sessionId };

                let newLikesList = {
                    $set: { likes: likes }
                };

                /*

                db.student.updateOne(
                    { _id: 1, "students.name": "Alex" },
                    { $set: { "students.$.email": "alex001@hotmail.com" } }
                  );

                  */


                db.collection("users").updateOne(query, newLikesList);
            }
        } catch (err) {
            console.log(err);
        }



    } else if (action === 'comment') {

    }

}