const sendResponse = async (model, page, limit, sortQuery, searchQuery, selectQuery, populate) => {
  let response = {};
  try {
    response.data = await model
      .find(searchQuery)
      .select(selectQuery)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit * 1)
      .populate(populate)
      .lean();
    response.count = await model.countDocuments(searchQuery).lean();
    response.totalPage = Math.ceil(response.count / limit);
    return response;
  } catch (err) {
    console.log(err);
  }
};

const parseFilters = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  let sortQuery = { _id: -1 };
  if (req.query.sort) {
    const [sortKey, sortOrder] = req.query.sort.split(':');
    sortQuery = { [sortKey]: sortOrder === 'desc' ? -1 : 1 };
  }

  return {
    page,
    limit,
    sortQuery,
    searchQuery: {$or: [{is_deleted: false}, {is_deleted: null}]},
    selectQuery: '',
    populate: []
  };
};
var sendSuccessResponse = async (res, status = 200, msg = null, data = null, token = null) => {
  var response = {
    status: status,
    success: true
  };
  if (token != null) response.token = null;
  msg ? (response.message = msg) : (response.msg = 'No success message');
  data ? (response.data = data) : (response.data = {});
  res.status(status).send(response);
};

var sendErrorResponse = async (res, status = 500, msg = null, data = null, error = null) => {
  var response = {
    status: status,
    success: false,
    error: error ? error : ``
  };
  if (msg) response.message = msg;
  if (data) response.data = data;
  res.status(status).send(response);
};

module.exports = {
  sendResponse,
  parseFilters,
  sendSuccessResponse,
  sendErrorResponse
};
