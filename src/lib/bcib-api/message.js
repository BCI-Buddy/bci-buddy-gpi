const MTU = 4096;
const EOT = "\r\n";

const RequestType = Object.freeze({
    PING: 'PING',
    PIPE: 'PIPE',
    CONTROL: 'CONTROL',
    STATUS: 'STATUS'
});

const ResponseType = Object.freeze({
    PONG: 'PONG',
    OK: 'OK',
    ERROR: 'ERROR'
});

class Request {
    constructor(request_type, payload) {
        if (!Object.values(RequestType).includes(request_type)) {
            throw new Error('Invalid request type');
        }
        this.type = request_type;
        this.payload = payload || {};
    }

    static deserialize(data) {
        let parsedData;
        try {
            parsedData = JSON.parse(data.toString());
        } catch (e) {
            throw new Error(`Improper Request format: ${e.message}`);
        }

        const typeEntry = parsedData.type;
        if (!typeEntry) {
            throw new Error("Request type not found in data");
        }

        const request_type = RequestType[typeEntry];
        const payload = parsedData.payload;
        if (!payload) {
            throw new Error("Payload not found in data");
        }

        return new Request(request_type, payload);
    }

    serialize() {
        return Buffer.from(JSON.stringify({
            type: this.type,
            payload: this.payload
        }) + EOT);
    }

    toString() {
        return `Request(${this.request_type}, ${JSON.stringify(this.payload)})`;
    }
}

class Response {
    constructor(response_type, payload) {
        if (!Object.values(ResponseType).includes(response_type)) {
            throw new Error('Invalid response type');
        }
        this.type = response_type;
        this.payload = payload || {};
    }

    static deserialize(data) {
        let parsedData;
        try {
            parsedData = JSON.parse(data.toString());
        } catch (e) {
            throw new Error(`Improper Response format: ${e.message}`);
        }

        const typeEntry = parsedData.type;
        if (!typeEntry) {
            throw new Error("Response type not found in data");
        }

        const response_type = ResponseType[typeEntry];
        const payload = parsedData.payload;
        if (!payload) {
            throw new Error("Payload not found in data");
        }

        return new Response(response_type, payload);
    }

    static ok(message, payload = {}) {
        return new Response(ResponseType.OK, { message, ...payload });
    }

    static error(message, payload = {}) {
        return new Response(ResponseType.ERROR, { message, ...payload });
    }

    serialize() {
        return Buffer.from(JSON.stringify({
            type: this.response_type,
            payload: this.payload
        }) + EOT);
    }

    toString() {
        return `Response(${this.response_type}, ${JSON.stringify(this.payload)})`;
    }
}

export default {
    RequestType,
    ResponseType,
    Request,
    Response
};