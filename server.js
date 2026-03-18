const express = require("express");
const multer = require("multer");
const parsePDF = require("./parser");
const { createMondayItem, uploadFileToMonday } = require("./monday");

const app = express();

// ✅ FIX: preserve original filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {

    const data = await parsePDF(req.file.path);

    const itemId = await createMondayItem(data);

    // ✅ FIX: pass original filename
    await uploadFileToMonday(itemId, req.file.path, req.file.originalname);

    res.send("Work order sent to Monday successfully");

  } catch (err) {

    console.error(err);
    res.status(500).send("Error processing work order");

  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});