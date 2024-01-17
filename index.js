import http from 'http';
import { MongoClient } from 'mongodb';
import { handlePath } from './handlers/pathHandler.js';

const port = 3000;

let mongoConn = await MongoClient.connect('mongodb://127.0.0.1:27017');
let db = mongoConn.db('SocialMedia');


async function handleRequests(req, res) {
    let url = new URL(req.url, 'http://' + req.headers.host);
    let path = url.pathname;

    let pathSegments = path.split('/').filter((element) => {
        return element !== '';
    });
    handlePath(req, res, pathSegments, db);

}

const app = http.createServer(handleRequests);

app.listen(port, () => {
    console.log(`Server listeing on port ${port}`);
});