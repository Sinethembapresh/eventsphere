// TokenManager.js

// Store tokens for each service separately
let momoCollectionToken = null;


// ========== Collection Token ==========
function setMomoCollectionToken(token) {
  momoCollectionToken = token;
}

function getMomoCollectionToken() {
  return momoCollectionToken;
}



// ========== Export all ==========
module.exports = {
  setMomoCollectionToken,
  getMomoCollectionToken,
  
};
