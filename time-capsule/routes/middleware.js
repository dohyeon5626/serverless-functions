export const notFound = (req, res, next) => {
    return res.status(404).json({
        status: 404,
        message: "Not Found"
    });
}

export const errorHandler = (err, req, res, next) => {
    console.log(err)
    if (!err.status || !err.message) {
      res.status(500)
        .json({
          status: 500,
          message: "International Server Error"
        });
    } else {
      res.status(err.status)
        .json({
          status: err.status,
          message: err.message
        });
    }
}