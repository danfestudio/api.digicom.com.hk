const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // let fileDestination = 'public/uploads/';
    let fileDestination = 'public/uploads/';
    if (req.type == null || req.type == undefined) {
      let type = file.mimetype.split('/')[0] + 's';
      req.type = type == 'applications' ? 'files' : type;
    }
    fileDestination += req.type;
    if (!fs.existsSync(fileDestination)) {
      fs.mkdirSync(fileDestination, { recursive: true });
      cb(null, fileDestination);
    } else cb(null, fileDestination);
  },
  filename: function (req, file, cb) {
    file.originalname = file.originalname.replace(/\s+/g, ''); // Remove spaces from the filename
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype.split('/')[0] == 'image' || file.mimetype.split('/')[0] == 'video') {
    if (
      !file.originalname.match(
        /\.(jpg|jpeg|png|svg|JPG|JPEG|PNG|SVG|mp4|flv|3gp|mp3|mov|avi|mpeg|mkv|gif|webp)$/
      )
    ) {
      return cb(new Error('You can upload an image and video file only'), false);
    }
  } else if (file.mimetype.split('/')[0] == 'application') {
    if (
      !file.originalname.match(
        /\.(docx|txt|html|css|js|py|pdf|xlsx|xlsm|csv|ppt|pptx|ico|jpg|png|gif|svg|webp|tiff|psd|raw|bmp|heif|jfif|indd|zip|log|tbw|tar|bz2|rtf|rar|rar4|DOCX|TXT|PDF|XLSX|XLSM|JFIF|ICO|CSV|PPT|PPTX|JPG|PNG|GIF|SVG|WEBP|TIFF|PSD|RAW|BMP|HEIF|INDD|JPEG|ZIP|LOG|TBW|TAR|BZ2|RTF|RAR|RAR4)$/
      )
    ) {
      return cb(new Error('Invalid file format'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
