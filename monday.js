const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYzMzYxMzkzOSwiYWFpIjoxMSwidWlkIjoxMDEwNDc2NjUsImlhZCI6IjIwMjYtMDMtMTZUMTQ6MTg6MzMuNDkxWiIsInBlciI6Im1lOndyaXRlIiwiYWN0aWQiOjM0MjQ3MTk2LCJyZ24iOiJhcHNlMiJ9.zZJBzfJc8O6QjPXne38HtA-kg4gthjiOJOYsNAmPYpM";
const BOARD_ID = 5027241568;

// ✅ CREATE ITEM (UNCHANGED)
async function createMondayItem(data) {
  try {

    const columnValues = {
      text_mm1geks0: data.workOrder || "",
      text_mm1gdjbp: data.poNumber || "",
      text_mm1g5yya: data.state || "",
      text_mm1gfjzr: (data.description || "").replace(/\n/g, " "),
      long_text_mm1gky2f: (data.shipTo || "").replace(/\n/g, " ")
    };

    const query = `
  mutation ($columnValues: JSON!) {
    create_item(
      board_id: ${BOARD_ID},
      item_name: "${(data.shipTo || `WO ${data.workOrder}`).replace(/\n/g, " ").replace(/"/g, '\\"')}",
      column_values: $columnValues
    ) {
      id
    }
  }
`;

    const response = await axios.post(
      "https://api.monday.com/v2",
      {
        query,
        variables: {
          columnValues: JSON.stringify(columnValues)
        }
      },
      {
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const itemId = response.data.data.create_item.id;

    console.log("Item created:", itemId);

    return itemId;

  } catch (error) {

    console.log("Monday API Error:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}


// ✅ FILE UPLOAD (ONLY FIX HERE)
async function uploadFileToMonday(itemId, filePath, originalName) {
  try {

    const formData = new FormData();

    const query = `
      mutation ($file: File!) {
        add_file_to_column (
          item_id: ${itemId},
          column_id: "file_mm1gd4m4",
          file: $file
        ) {
          id
        }
      }
    `;

    formData.append("query", query);

    // ✅ FIX: keep original filename + PDF type
    formData.append(
      "variables[file]",
      fs.createReadStream(filePath),
      {
        filename: originalName || "workorder.pdf",
        contentType: "application/pdf"
      }
    );

    await axios.post(
      "https://api.monday.com/v2/file",
      formData,
      {
        headers: {
          Authorization: API_KEY,
          ...formData.getHeaders()
        }
      }
    );

    console.log("✅ File uploaded successfully");

  } catch (error) {

    console.log("❌ File Upload Error:");
    console.log(error.response?.data || error.message);

  }
}

module.exports = { createMondayItem, uploadFileToMonday };