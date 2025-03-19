// const Contact = require('../contact/contact.model')
// const Blog = require('../blog/blog.model')

// // @route POST dashboard/
// // @desc fetch dashboard
// exports.fetchDashboardData = async (req, res, next) => {
//   try {
//     const blogCount = await Blog.countDocuments({ is_deleted: false })
//     const contactCount = await Contact.countDocuments({ is_deleted: false })

//     let response = {
//       blogCount,
//       contactCount,
//     }
//     res.status(200).json({ success: true, data: response })
//   } catch (error) {
//     res.json({
//       success: false,
//       message: 'Failed to get data',
//       error: error.message,
//     })
//   }
// }
