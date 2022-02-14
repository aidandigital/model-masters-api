const multer = require("multer");
const uuid = require("uuid");
const path = require("path");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();

const storage = multer.diskStorage({
  // Destination to store image
  destination: "uploadedImgs",
  filename: (req, file, cb) => {
    cb(
      null,
      uuid.v4() + path.extname(file.originalname)
    );
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

var multerUpload = multer({ storage: storage, fileFilter: checkFileType });

function cloudinaryUpload(file, parent_id, metadataStr) {
  return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file,
          (result) => {
          if (result.secure_url) {
              resolve(result.secure_url)
          } else {
              reject("failed to upload image (cloudinary error)")
          }
      },
      {
          resource_type: "auto",
          folder: process.env.CLOUDINARY_FOLDER + "/" + parent_id,
          use_filename: true,
          unique_filename: false,
          metadata: metadataStr,
          quality: "auto",
      }
    )
  })
}
function clearCloudinaryFolder(folder = "parent-object-id") {
  // Not promise based because we can't easily tell if this was successful
  let fullFolder = process.env.CLOUDINARY_FOLDER + "/" + folder;
  cloudinary.api.delete_resources_by_prefix(fullFolder + "/", () => {});
}

module.exports = {
  multerUpload,
  cloudinaryUpload,
  clearCloudinaryFolder,
};