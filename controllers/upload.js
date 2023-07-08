
function handlePostUploadFiles(req, res) {
    try {
      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        mimetype: file.mimetype
      }));
      return res.status(200).send({ statusCode: 200, files: uploadedFiles });
      // return res.status(200).send({ statusCode: 200, filename: req.file.filename, mimetype: req.file.mimetype });
    } catch (err) {
      return res.status(500).send({ statusCode: 500, message: 'Internal server error' });
    }
  }

  module.exports = {
    handlePostUploadFiles,
  }