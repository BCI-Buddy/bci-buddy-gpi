class Request {
    static RequestType = {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE'
    };

    constructor(request_type, payload) {
        if (!Object.values(Request.RequestType).includes(request_type)) {
            throw new Error('Invalid request type');
        }
        this.request_type = request_type;
        this.payload = payload || {};
    }
}

class Response {
    static ResponseType = {
        SUCCESS: 'SUCCESS',
        ERROR: 'ERROR'
    };

    constructor(response_type, payload) {
        if (!Object.values(Response.ResponseType).includes(response_type)) {
            throw new Error('Invalid response type');
        }
        this.response_type = response_type;
        this.payload = payload || {};
    }
}

module.exports = {
    Request: Request,
    Response: Response
};