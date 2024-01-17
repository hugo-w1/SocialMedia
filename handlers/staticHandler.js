import fs from 'fs/promises';
/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {string[]} pathSegments 
 */
export async function handleStatic(req, res, pathSegments) {
    let seg = pathSegments.shift();
    switch (seg) {
        case 'css':
            sendFile((seg + '/' + pathSegments.shift()), { 'Content-Type': 'text/css' });
            break;
        case 'js':
            sendFile((seg + '/' + pathSegments.shift()), { 'Content-Type': 'text/javascript' });
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404, Not Found');
            res.end();
            break;
    }

    async function sendFile(filePath, contentType) {
        let content = await fs.readFile(`./static/${filePath}`);
        res.writeHead(200, contentType);
        res.write(content);
        res.end();
    }
}