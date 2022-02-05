const multer = require('multer');
const fs = require('fs');
const path = require('path');

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

const checkPath = (uploadPath) => {
  const serverPath = path.resolve();
  const splitPaths = uploadPath.split('/');
  const checkPaths = splitPaths.map((_, pathIndex) => {
    return splitPaths.slice(0, pathIndex + 1).join('/');
  });

  const checkAndCreate = (checkPath) => {
    const localPath = path.join(serverPath, checkPath);
    const isPathExist = fs.existsSync(localPath);
    if (!isPathExist) {
      fs.mkdirSync(localPath);
    }
  };

  console.log('checkPaths', checkPaths);
  checkPaths.forEach(checkAndCreate);
};

exports.userFile = ((req, res, next) => {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const { id } = req.user;
      const destination = `uploads/user/${id}`;

      checkPath(destination);

      fs.access(destination, fs.constants.F_OK, (err) => {
        if (err) throw err;
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

exports.chatFile = ((req, res, next) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { id } = req.body;
      const destination = `uploads/chat/${id}`;

      checkPath(destination);

      fs.access(destination, fs.constants.F_OK, (err) => {
        // If the folder doesn't exist, create it
        if (err) {
          return fs.mkdir(destination, (err) => {
            cb(err, destination);
          });
        }

        // if it exists
        else {
          return cb(null, destination);
        }
      });
    },
    filename: generateFileName,
  });

  return multer({
    storage,
    fileFilter,
  }).single('image');
})();
