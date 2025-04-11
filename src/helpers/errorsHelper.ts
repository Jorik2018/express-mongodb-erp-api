class ErrorHandler extends Error {

    statusCode;

    constructor(statusCode: string, message: string) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }

}

export default {
    ErrorHandler,
};