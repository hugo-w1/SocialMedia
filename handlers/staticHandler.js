import fs from 'fs/promises';
/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {string[]} pathSegments 
 */

export async function handleStatic(req, res, pathSegments) {
    let seg = pathSegments.shift(); // css || js
    switch (seg) {
        case 'css':
            sendFile(('./static/' + seg + '/' + pathSegments.shift()), { 'Content-Type': 'text/css' });
            break;
        case 'js':
            sendFile(('./static/' + seg + '/' + pathSegments.shift()), { 'Content-Type': 'text/javascript' });
            break;
        case 'userUploads':
            let fileName = pathSegments.shift();
            let ext = fileName.split('.')[1];
            //switch file extension
            switch (ext) {
                case 'png':
                    sendFile(`./userUploads/${fileName}`, { 'Content-Type': 'image/png' });
                    break;
                case 'jpg':
                    sendFile(`./userUploads/${fileName}`, { 'Content-Type': 'image/jpg' });
                    break;
                case 'jpeg':
                    sendFile(`./userUploads/${fileName}`, { 'Content-Type': 'image/jpeg' });
                    break;
            }
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404, Not Found');
            res.end();
            break;
    }

    async function sendFile(filePath, contentType) {
        let content = await fs.readFile(filePath);
        res.writeHead(200, contentType);
        res.write(content);
        res.end();
    }
}