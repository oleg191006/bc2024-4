const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');

program
    .requiredOption('-h, --host <host>', 'Адреса сервера')
    .requiredOption('-p, --port <port>', 'Порт сервера')
    .requiredOption('-c, --cache <cache>', 'Шлях до кешу')
    .parse(process.argv);

const options = program.opts();

const server = http.createServer(async (req, res) => {
    const urlParts = req.url.split('/');
    const httpCode = urlParts[1];
    const imagePath = path.join(options.cache, `${httpCode}.jpg`);

    switch (req.method) {
        case 'GET':
            try {
                const image = await fs.readFile(imagePath); // Спроба прочитати картинку з кешу
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(image); // Відправляємо картинку, якщо знайдена
            } catch (error) {
                // Якщо картинки немає, повертаємо 404
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found');
            }
            break;

        case 'PUT':
            try {
                const data = await new Promise((resolve, reject) => {
                    const chunks = [];
                    req.on('data', chunk => chunks.push(chunk));
                    req.on('end', () => resolve(Buffer.concat(chunks)));
                    req.on('error', reject);
                });

                if (data.length > 0) {
                    // Зберігаємо картинку у кеш
                    await fs.writeFile(imagePath, data);
                    res.writeHead(201, { 'Content-Type': 'text/plain' });
                    res.end('Image saved');
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('No data provided');
                }
            } catch (error) {
                console.error('Error saving image:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error saving image');
            }
            break;

        case 'DELETE':
            try {
                await fs.unlink(imagePath);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Image deleted');
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found');
            }
            break;

        default:
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method not allowed');
            break;
    }
});

server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
});

