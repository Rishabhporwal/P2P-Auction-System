const RPC = require("@hyperswarm/rpc");
const DHT = require("hyperdht");
const { logger } = require("./utils");

// Function to start the auction client
async function startClient() {
  // Create a new DHT instance for peer discovery
  const dht = new DHT();

  // Create an RPC instance for communication
  const rpc = new RPC({ dht });

  // Public key of the auction server (replace with actual key)
  const serverPublicKey = Buffer.from("<INSERT_SERVER_PUBLIC_KEY>", "hex");

  // Function to open an auction
  async function openAuction(auctionId, item, startingPrice) {
    const payload = { auctionId, item, startingPrice };
    const response = await rpc.request(
      serverPublicKey,
      "openAuction",
      Buffer.from(JSON.stringify(payload))
    );
    logger.info(`Open Auction Response: ${response.toString("utf-8")}`);
  }

  // Function to make a bid on an auction
  async function makeBid(auctionId, bidder, bidAmount) {
    const payload = { auctionId, bidder, bidAmount };
    const response = await rpc.request(
      serverPublicKey,
      "makeBid",
      Buffer.from(JSON.stringify(payload))
    );
    logger.info(`Make Bid Response: ${response.toString("utf-8")}`);
  }

  // Function to close an auction
  async function closeAuction(auctionId) {
    const payload = { auctionId };
    const response = await rpc.request(
      serverPublicKey,
      "closeAuction",
      Buffer.from(JSON.stringify(payload))
    );
    logger.info(`Close Auction Response: ${response.toString("utf-8")}`);
  }

  // Example interactions
  await openAuction("Pic#1", "Picture of a cat", 75);
  await openAuction("Pic#2", "Picture of a Dog", 60);
  await makeBid("Pic#1", "client2", 75);
  await makeBid("Pic#1", "client3", 75.5);
  await makeBid("Pic#1", "client2", 80);
  await closeAuction("Pic#1");

  await rpc.destroy();
  await dht.destroy();
}

module.exports = { startClient };
