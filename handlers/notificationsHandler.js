import Cookies from "cookies";
/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 */
export async function handleNotification(req, res, db) {
    if (req.method === 'POST') {
        var cookies = new Cookies(req, res);
        let sessionId = cookies.get('sessionId');

        /*
        let result = await db.collection('users').findOne({
            sessionId: sessionId
        });
        */

        //remove all notifications

        let query = { sessionId: sessionId };

        let clearNotificaions = {
            $set: { notifications: [] }
        };

        //update the friend adders db.
        db.collection("users").updateOne(query, clearNotificaions);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ 'success': true }));
        res.end();



        /*

        add feature that user can delete one speficic notifcation
        let chunks = [];
        req.on('data', function (chunk) {
            chunks.push(chunk);
        });

        req.on('end', async function () {
            let data = JSON.parse(chunks);


        });
*/
    }
}