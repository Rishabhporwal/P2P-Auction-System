const Hypercore = require("hypercore");
const Hyperbee = require("hyperbee");

// Initialize Hypercore and Hyperbee for storage
const hypercore = new Hypercore("./db/auctions");
const db = new Hyperbee(hypercore, {
  keyEncoding: "utf-8",
  valueEncoding: "json",
});

// Function to save auction data
async function saveAuction(auctionId, data) {
  await db.put(auctionId, data);
}

// Function to retrieve auction data
async function getAuction(auctionId) {
  const result = await db.get(auctionId);
  return result ? result.value : null;
}

// Function to update auction data
async function updateAuction(auctionId, data) {
  await db.put(auctionId, data);
}

// Function to delete auction data
async function deleteAuction(auctionId) {
  await db.del(auctionId);
}

module.exports = {
  saveAuction,
  getAuction,
  updateAuction,
  deleteAuction,
};
