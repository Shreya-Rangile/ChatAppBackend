const multer = require("multer");

//MULTER SETUP
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = file.originalname.split(".").pop();
      // cb(null, Date.now() + "-" + file.originalname)
      cb(null, uniqueSuffix + "." + fileExtension);
    }
  });
  
  const upload = multer({ storage: storage });

  module.exports = {
    upload: upload,
  };
