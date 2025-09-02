const path = require("path");
const fs = require("fs");

const downloadFile = async (req, res) => {
  const { filePath, title } = req.query;

  const file = path.join(__dirname, "..", filePath);

  // Use title from params, fallback to original filename if not provided
  const saveName = title
    ? `${title}${path.extname(file)}`
    : path.basename(file);

  res.download(file, saveName);
};

exports.downloadFile = downloadFile;
