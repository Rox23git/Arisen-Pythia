const getSheetSummary = require('./getSheetSummary');

async function getLatestSummary(doc, bonuses) {
    // Access the second sheet (index 1) as the weekSheet
    const weekSheet = doc.sheetsByIndex[1];

    // Load cells in the range A1:Z84, which covers all needed data
    // Moved cell loading to loadSpreadsheet
        // await weekSheet.loadCells('A1:Z84');

    // Validate the sheet by checking a specific cell
    if (weekSheet.getCell(2, 0).value !== 'Arcanist Map') {
        return ['Something seems to be wrong with this spreadsheet. Please alert the manager of the sheet.'];
    }

    // Generate and return the summary
    return await getSheetSummary(doc, weekSheet, bonuses);
}

module.exports = getLatestSummary;