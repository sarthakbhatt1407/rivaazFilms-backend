const downloadFile = async (req, res) => {
  const { filePath } = req.query;

  const file = `${__dirname}/../${filePath}`;

  res.download(file);
};

exports.downloadFile = downloadFile;
