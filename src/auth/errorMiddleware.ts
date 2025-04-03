const errorMiddleware = (err: any, _req: any, res: any, _next: any) => {
  const { statusCode, message } = err;
  console.log("Error status: ", statusCode);
  console.log("Message: ", message);
  res.status(statusCode || 500);
  res.json({
    statusCode,
    message,
  });
};

export default errorMiddleware;
