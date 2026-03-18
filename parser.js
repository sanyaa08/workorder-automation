const fs = require("fs");
const pdf = require("pdf-parse");

async function parsePDF(filePath) {

  console.log("before file upload");

  const buffer = fs.readFileSync(filePath);

  const data = await pdf(buffer);

  const text = data.text;

  const workOrder = text.match(/Work Order:\s*(\d+)/)?.[1];
  const poNumber = text.match(/P\.O\.\s*#:\s*(\d+)/)?.[1];
  const shipTo = text.match(/Oneway Brunswick[\s\S]*?31520/)?.[0];
  const state = text.match(/Brunswick,\s*([A-Z]{2})\s*\d{5}/)?.[1];
  const description = text.match(/JPro[\s\S]*?Sign off required\./)?.[0];

  console.log("Extracted:");
  console.log({ workOrder, poNumber, description, shipTo, state });

  return {
    workOrder,
    poNumber,
    description,
    shipTo,
    state
  };
}

module.exports = parsePDF;