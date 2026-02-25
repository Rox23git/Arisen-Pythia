const { GoogleSpreadsheet } = require('google-spreadsheet');
const { client_email, private_key } = require('../config/amityhunter-service-account.json');

// Due to HTTP error 429 / API throttling from google, implementing retries/error handling

async function loadSpreadsheet(sheetId, retries = 0) {
  try {
    if (/docs\.google\.com/i.test(sheetId)) {
      // Extracting the ID from a given URL via regex
      const matchedID = sheetId.match(/\/d\/.*\//)[0];
      sheetId = matchedID.slice(3, matchedID.length - 1)
    }
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth({ client_email, private_key });
    await doc.loadInfo();

    // Load cells in the 2nd sheet, specifically needed for amityhunter
    await doc.sheetsByIndex[1].loadCells('A1:Z84');

    return doc;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const delay = Math.pow(1.5, retries) * 7000; // e.g., 1s, 2s, 4s
      console.log(`Rate limit hit for ${sheetId}, retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      if (retries < 8) { // Cap retries to avoid infinite loops
        return loadSpreadsheet(sheetId, retries + 1);
      } else {
        throw new Error(`Max retries reached for ${sheetId}`);
      }
    } else if (error.response && error.response.status === 503) {
      const delay = Math.pow(1.5, retries) * 7000; // e.g., 1s, 2s, 4s
      console.log(`Error 503 in loading ${sheetId}, retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      if (retries < 8) { // Cap retries to avoid infinite loops
        return loadSpreadsheet(sheetId, retries + 1);
      } else {
        throw new Error(`Max retries reached for ${sheetId}, error 503`);
      }
    } else {
      throw error; // Rethrow non-429 errors
    }
  }
}

module.exports = loadSpreadsheet;