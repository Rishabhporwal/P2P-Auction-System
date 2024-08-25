const { startServer } = require("./src/auctionServer");
const { startClient } = require("./src/auctionClient");

// Determine mode from command-line arguments
const mode = process.argv[2];

if (mode === "server") {
  startServer(); // Start the auction server
} else if (mode === "client") {
  startClient(); // Start the auction client
} else {
  console.log("Please specify mode: 'server' or 'client'");
}
