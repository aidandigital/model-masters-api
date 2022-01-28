const multer = require("multer");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp")

const storage = multer.diskStorage({
  // Destination to store image
  destination: "fsData/uploaded",
  filename: (req, file, cb) => {
    cb(
      null,
      uuid.v4() + path.extname(file.originalname)
    );
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});

function checkFileType(req, file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("invalid file type (user error)");
  }
}

// Moves new images in the "uploaded" folder to a custom dir within the "live" folder
async function moveImagesToLiveDir(imageNamesArr, dirName) {
    await fs.mkdir("./fsData/live/" + dirName, async (dir_err) => {
      if (!dir_err) {
        imageNamesArr.forEach(async (imageName) => {
          const oldPath = "./fsData/uploaded/" + imageName;
          const newPath = "./fsData/live/" + dirName + "/" + imageName;
          await fs.rename(oldPath, newPath, (err) => {
            if (err) {
              throw err;
            }
          })
        })
      } else {
        throw dir_err;
      }
    });
}

function moveDirsToFolder(parentIdsArr, oldFolder, newFolder) {
  parentIdsArr.forEach((parent_id) => {
    fs.rename("./fsData/" + oldFolder + "/" + parent_id, "./fsData/" + newFolder + "/" + parent_id, (err) => {
      if (err) return false;
    })
  })
  return true;
}

function compressJpeg(path) {
  sharp(path).jpeg({
    quality: 80,
    chromaSubsampling: '4:4:4'
  }).toBuffer((err, buffer) => {
    // Must write file using buffer in order to be able to replace image in FS
    if (err) {
      console.log("Could not get buffer from " + path + " for compression");
    } else {
      fs.writeFile(path, buffer, () => {});
    }
});
}

var multerUpload = multer({ storage: storage, fileFilter: checkFileType });

module.exports = {
  multerUpload,
  moveImagesToLiveDir,
  moveDirsToFolder,
  compressJpeg,
};
