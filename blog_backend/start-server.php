<?php
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

require dirname(__DIR__) .'\blog_backend\vendor\autoload.php';
require dirname(__DIR__, 1) .'\blog_backend\protected\components\WebSocketServer.php';

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new WebSocketServer()
        )
    ),
    8081
);

echo "WebSocket server running on port 8081\n";
$server->run();
