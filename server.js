const http = require('http');
const { program } = require('commander');
const superagent = require('superagent');

program
    .requiredOption('-h, --host <host>', 'Адреса сервера')
    .requiredOption('-p, --port <port>', 'Порт сервера')
    .requiredOption('-c, --cache <cache>', 'Шлях до кешу')
    .parse(process.argv);

const options = program.opts();

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
});


server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
});


