const upload = require('../../upload/upload')

exports.addImageContent = async function (req, res) {
  upload.single('image')(req, res, err => {
    if (err) {
      res.json({
        success: false,
        message: err.message,
      })
    } else {
      delete req.body.event
      // req.body.imageUrl = req.file.filename
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({
        success: true,
        message: `Content Image Uploaded`,
        imagedata: req.file.filename,
        link: `${process.env.BACKEND_URL}/uploads/images/${req.file.filename}`, // froala editor expects JSON object containing a link field with the link to the uploaded image.
      })
    }
  })
}

exports.addVideoAsContent = async function (req, res) {
  upload.single('video')(req, res, err => {
    if (err) {
      res.json({
        success: false,
        message: err.message,
      })
    } else {
      // req.body.imageUrl = req.file.filename
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({
        success: true,
        message: `Content Video Uploaded `,
        imagedata: req.file.filename,
        link: `${process.env.BACKEND_URL}/uploads/videos/${req.file.filename}`,
      })
    }
  })
}

exports.addFileAsContent = async function (req, res) {
  upload.single('file')(req, res, err => {
    if (err) {
      res.json({
        success: false,
        message: err.message,
      })
    } else {
      delete req.body.event
      req.body.fileUrl = req.file.filename
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({
        success: true,
        message: `Content File Uploaded `,
        imagedata: req.file.filename,
        link: `${process.env.BACKEND_URL}/uploads/files/${req.file.filename}`,
      })
    }
  })
}
