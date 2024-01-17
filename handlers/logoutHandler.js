import Cookies from "cookies";
import { randomUUID } from 'crypto';
/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 */
export async function handleLogout(req, res, db) {
    if (req.method === 'POST') {

        var cookies = new Cookies(req, res);
        let sessionId = cookies.get('sessionId');

        let newRandomSessionId = randomUUID();

        let query = { sessionId: sessionId };

        let newSessionId = { $set: { sessionId: newRandomSessionId } };

        try {
            db.collection("users").updateOne(query, newSessionId);
        } catch (err) {
            console.log(err);
            res.writeHead(409, { 'Content-Type': 'text/html' });
            res.write("409 Conflict");
            res.end();
        }
        res.writeHead(303, { 'Location': `/` });
        res.end();

    }
}