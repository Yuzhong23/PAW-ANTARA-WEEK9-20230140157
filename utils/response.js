function sendResponse(
  res,
  { code = 200, success = true, message = "", data = null },
) {
  return res.status(code).json({
    code,
    success,
    message,
    data,
  });
}

function sendError(res, message = "Terjadi kesalahan pada server", code = 500) {
  return sendResponse(res, {
    code,
    success: false,
    message,
    data: null,
  });
}

module.exports = sendResponse;
module.exports.sendError = sendError;
