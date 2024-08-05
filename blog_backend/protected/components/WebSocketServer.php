<?php
// Import necessary classes from Ratchet library
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

// Define a WebSocket server class implementing the MessageComponentInterface
class WebSocketServer implements MessageComponentInterface {
    // Store the connected clients
    protected $clients;

    // Constructor initializes the SplObjectStorage to keep track of connections
    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    // Method called when a new connection is opened
    public function onOpen(ConnectionInterface $conn) {
        // Attach the new connection to the clients collection
        $this->clients->attach($conn);
        // Output the resource ID of the new connection
        echo "New connection! ({$conn->resourceId})\n";
    }

    // Method called when a message is received from a client
    public function onMessage(ConnectionInterface $from, $msg) {
        // Iterate over each connected client
        foreach ($this->clients as $client) {
            // Send the message to all clients except the sender
            if ($from !== $client) {
                $client->send($msg);
            }
        }
    }

    // Method called when a connection is closed
    public function onClose(ConnectionInterface $conn) {
        // Detach the connection from the clients collection
        $this->clients->detach($conn);
        // Output the resource ID of the closed connection
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    // Method called when an error occurs
    public function onError(ConnectionInterface $conn, \Exception $e) {
        // Output the error message
        echo "An error has occurred: {$e->getMessage()}\n";
        // Close the connection
        $conn->close();
    }
}
