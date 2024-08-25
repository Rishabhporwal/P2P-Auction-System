const RPC = require('@hyperswarm/rpc');
const DHT = require('hyperdht');
const { saveAuction, updateAuction, deleteAuction } = require('./storage');
const { logger } = require('./utils');

// Function to start the auction server
async function startServer() {
    // Create a new DHT instance for peer discovery
    const dht = new DHT();
    
    // Create an RPC instance for communication
    const rpc = new RPC({ dht });
    
    // Create a new RPC server
    const server = rpc.createServer();
    
    // Map to store auctions in memory
    const auctions = new Map();

    // Respond to 'openAuction' requests
    server.respond('openAuction', async (reqRaw) => {
        try {
            // Parse the request
            const { auctionId, item, startingPrice } = JSON.parse(reqRaw.toString('utf-8'));
            
            // Check if the auction already exists
            if (auctions.has(auctionId)) {
                logger.warn(`Auction ${auctionId} already exists.`);
                return Buffer.from(JSON.stringify({ status: 'Auction already exists' }));
            }
            
            // Create new auction data
            const auctionData = { item, startingPrice, highestBid: startingPrice, highestBidder: null };
            auctions.set(auctionId, auctionData);
            await saveAuction(auctionId, auctionData);
            
            logger.info(`Auction opened: ${auctionId}`);
            return Buffer.from(JSON.stringify({ status: 'Auction opened' }));
        } catch (error) {
            logger.error(`Error opening auction: ${error}`);
            return Buffer.from(JSON.stringify({ status: 'Error opening auction' }));
        }
    });

    // Respond to 'makeBid' requests
    server.respond('makeBid', async (reqRaw) => {
        try {
            // Parse the request
            const { auctionId, bidder, bidAmount } = JSON.parse(reqRaw.toString('utf-8'));
            const auction = auctions.get(auctionId);

            // Check if the auction exists
            if (!auction) {
                logger.warn(`Auction ${auctionId} not found.`);
                return Buffer.from(JSON.stringify({ status: 'Auction not found' }));
            }

            // Check if the bid is higher than the current highest bid
            if (bidAmount <= auction.highestBid) {
                logger.warn(`Bid ${bidAmount} is too low for auction ${auctionId}.`);
                return Buffer.from(JSON.stringify({ status: 'Bid too low' }));
            }

            // Update auction with the new bid
            auction.highestBid = bidAmount;
            auction.highestBidder = bidder;
            await updateAuction(auctionId, auction);

            logger.info(`New bid on auction ${auctionId}: ${bidAmount} by ${bidder}`);
            return Buffer.from(JSON.stringify({ status: 'Bid accepted' }));
        } catch (error) {
            logger.error(`Error making bid: ${error}`);
            return Buffer.from(JSON.stringify({ status: 'Error making bid' }));
        }
    });

    // Respond to 'closeAuction' requests
    server.respond('closeAuction', async (reqRaw) => {
        try {
            // Parse the request
            const { auctionId } = JSON.parse(reqRaw.toString('utf-8'));
            const auction = auctions.get(auctionId);

            // Check if the auction exists
            if (!auction) {
                logger.warn(`Auction ${auctionId} not found.`);
                return Buffer.from(JSON.stringify({ status: 'Auction not found' }));
            }

            // Remove auction from memory and database
            auctions.delete(auctionId);
            await deleteAuction(auctionId);

            logger.info(`Auction closed: ${auctionId}`);
            return Buffer.from(JSON.stringify({
                status: 'Auction closed',
                highestBid: auction.highestBid,
                highestBidder: auction.highestBidder
            }));
        } catch (error) {
            logger.error(`Error closing auction: ${error}`);
            return Buffer.from(JSON.stringify({ status: 'Error closing auction' }));
        }
    });

    // Start listening for RPC requests
    await server.listen();
    console.log(`Server public key: ${server.publicKey.toString('hex')}`);
    logger.info('Auction server is running...');
}

module.exports = { startServer };
