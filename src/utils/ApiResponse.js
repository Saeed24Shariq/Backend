class ApiResponse extends Error{
    constructor(
        statusCode,
        message = "Success",
        data
    ){
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.sucess = true;
        this.data = data;
    }
}
export {ApiResponse};