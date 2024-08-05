<?php
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

require dirname(__DIR__) .'\blog_backend\vendor\autoload.php';
require dirname(__DIR__, 1) .'\blog_backend\protected\components\WebSocketServer.php';

const WEBSOCKET_SERVER_PORT = 8081;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new WebSocketServer()
        )
    ),
    WEBSOCKET_SERVER_PORT
);

echo "WebSocket server running on port ".WEBSOCKET_SERVER_PORT." \n";
$server->run();
