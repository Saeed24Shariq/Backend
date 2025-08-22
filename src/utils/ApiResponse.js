class ApiResponse{
    constructor(
        statusCode,
        message = "Success",
        data
    ){
        this.statusCode = statusCode;
        this.message = message;
        this.sucess = true;
        this.data = data;
    }
}