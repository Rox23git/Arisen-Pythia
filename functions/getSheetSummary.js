// ok I wrote half the new code but shoutout Grok 3 i hate everything in here - Dave/ow/bravedown

const checkTier = require("../functions/checkTier");
const shorthandBonus = require("../functions/shorthandBonus");

async function getSheetSummary(doc, weekSheet, bonuses) {
  var nowDate = new Date();
  var currentHour = nowDate.getUTCHours();

  //const completionPercentCellString = weekSheet.getCell(0, 6).value;
  //const completionPercent = completionPercentCellString.match(/\d+(\.\d+)?%/)[0];

  let outputArray = [];
  let outputMessage = `## [${doc.title}](https://docs.google.com/spreadsheets/d/${doc.spreadsheetId}/)\n\n`;

  const baseValueRows = [5, 8, 11, 14, 17, 21, 24, 27, 30, 33, 37, 40, 43, 46, 49, 53, 56, 59, 62, 65, 69, 72, 75, 78, 81];
  const baseValueRowNames = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5", "C1", "C2", "C3", "C4", "C5", "D1", "D2", "D3", "D4", "D5", "E1", "E2", "E3", "E4", "E5"];

  // Mapping of letters to their question rows (e.g., A: 4, B: 20, etc.)
  const questionRows = {
    'A': baseValueRows[0] - 1,  // 4
    'B': baseValueRows[5] - 1,  // 20
    'C': baseValueRows[10] - 1, // 36
    'D': baseValueRows[15] - 1, // 52
    'E': baseValueRows[20] - 1  // 68
  };

  for (let c = 2; c < 26; c++) {
    // Header line with current hour highlighted
    let headerLine = (c - 2 === currentHour) ? `**__UTC ${c - 2}__**` : `**UTC ${c - 2}**`;
    const couchableValue = weekSheet.getCell(3, c).value;
    let couchLine = "";

    // Determine couchLine based on conditions
    if (!weekSheet.getCell(2, c).value) {
      if (couchableValue === "No") {
        couchLine = " 🚶\n";
      } else {
        couchLine = "\n";
      }
      let columnOutput = headerLine + couchLine;
      if (outputMessage.length + columnOutput.length > 1600) {
        outputArray.push(outputMessage);
        outputMessage = columnOutput;
      } else {
        outputMessage += columnOutput;
      }
      continue; // Skip to the next column
    } else if (couchableValue && couchableValue !== "No") {
      couchLine = ` 🛋️ 🗺️ ${couchableValue}\n`;
    } else if (couchableValue === "No") {
      couchLine = " 🚶 🗺️ \n";
    } else {
      couchLine = "\n";
    }

    const couchableLetters = new Set(couchableValue ? couchableValue.split('') : []);
    let emptyCells = [];
    let bonusLines = "";

    // Process rows to collect empty cells and bonus lines
    for (let i = 0; i < baseValueRows.length; i++) {
      const row = baseValueRows[i];
      const label = baseValueRowNames[i];
      const amityBonus = weekSheet.getCell(row, c).value;
      if (!amityBonus) {
        const letter = label[0];
        if (couchableLetters.has(letter)) {
          if (label.endsWith('5')) {
            // Only include "<letter>5" if the question contains "what hangs above thy mantle"
            const questionRow = questionRows[letter];
            const question = (weekSheet.getCell(questionRow, c).value || '').toLowerCase();
            if (question.includes('what hangs above thy mantel')) {
              emptyCells.push(label);
            }
          } else {
            // Include other rows if empty and letter is couchable
            emptyCells.push(label);
          }
        }
        continue;
      }
      const amityTier = checkTier(amityBonus, bonuses);
      if (amityTier !== 0) {
        let line = `     **${label}**: ${shorthandBonus(amityBonus, bonuses)}`;
        const legendaryBonus = weekSheet.getCell(row + 1, c).value;
        if (legendaryBonus) {
          const shortLegend = shorthandBonus(legendaryBonus, bonuses);
          line += ` // ${shortLegend}`;
          const ornateBonus = weekSheet.getCell(row + 2, c).value;
          if (ornateBonus) {
            const shortOrnate = shorthandBonus(ornateBonus, bonuses);
            line += ` // ${shortOrnate}`;
          }
        } else {
          line += " // *=???=*";
        }
        bonusLines += line + "\n";
      }
    }

    // Format empty cells into ranges
    const formattedEmptyCells = formatEmptyCells(emptyCells);
    let emptyCellsLine = formattedEmptyCells ? `*${formattedEmptyCells} Open*\n` : "";

    // Assemble column output
    let columnOutput = headerLine + couchLine + emptyCellsLine + bonusLines;

    // Handle output message length
    if (outputMessage.length + columnOutput.length > 1600) {
      outputArray.push(outputMessage);
      outputMessage = columnOutput;
    } else {
      outputMessage += columnOutput;
    }
  }
  outputArray.push(outputMessage);

  return outputArray;
}

// Helper function to format empty cells into ranges
function formatEmptyCells(emptyCells) {
  let grouped = {};
  emptyCells.forEach(cell => {
    const letter = cell[0];
    const number = parseInt(cell.slice(1));
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(number);
  });
  let formatted = [];
  for (let letter in grouped) {
    const numbers = grouped[letter].sort((a, b) => a - b);
    let ranges = [];
    let start = numbers[0];
    let end = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === end + 1) {
        end = numbers[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = numbers[i];
        end = numbers[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    formatted.push(ranges.map(range => letter + range).join(', '));
  }
  return formatted.join(', ');
}

module.exports = getSheetSummary;