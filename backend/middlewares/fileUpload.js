const multer = require('multer');
const fs = require('fs');
const path = require('path');

exports.userFile = ((req, res, next) => {
  const getFileType = (file) => {
    const mimeType = file.mimetype.split('/');
    return mimeType[mimeType.length - 1];
  };

  const generateFileName = (req, file, cb) => {
    const extension = getFileType(file);
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.${extension}`;

    cb(null, `${file.fieldname}-${fileName}`);
  };

  const fileFilter = (req, file, cb) => {
    const extension = getFileType(file);
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const passed = allowedExtensions.includes(extension);
    if (passed) {
      return cb(null, true);
    }

    return cb(null, false);
    // return cb(new Error('Invalid file type'), false);
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { id } = req.user;
      const destination = `uploads/user/${id}`;

      fs.access(destination, fs.constants.F_OK, (err) => {
        // If the folder doesn't exist, create it
        if (err) {
          return fs.mkdir(destination, (err) => {
            cb(err, destination);
          });
        }

        // if it exists
        else {
          fs.readdir(destination, (err, files) => {
            if (err) throw err;

            for (const file of files) {
              fs.unlink(path.join(destination, file), (err) => {
                if (err) throw err;
              });
            }
          });

          return cb(null, destination);
        }
      });
    },
    filename: generateFileName,
  });

  return multer({
    storage,
    fileFilter,
  }).single('avatar');
})();
