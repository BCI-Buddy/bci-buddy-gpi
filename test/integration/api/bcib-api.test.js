import BciBuddyClient from '../../../src/lib/bcib-api/client';
import message from '../../../src/lib/bcib-api/message';
const { Request, RequestType, Response, ResponseType } = message;

describe('BciBuddyClient TCP socket integration', () => {
    let client;

    beforeEach(async () => {
        client = new BciBuddyClient('tcp://127.0.0.1:2392');
        await client.initialize();
    });

    test('should send a ping request and get a pong response', async () => {
        const request = new Request(RequestType.PING);
        const response = await client.sendRequest(request);
        expect(response.type).toEqual(ResponseType.PONG);
        expect(response.payload).toEqual({});
    });

    test('should send an empty pipe request and get error response', async () => {
        const request = new Request(RequestType.PIPE, {});
        const response = await client.sendRequest(request);
        expect(response.type).toEqual(ResponseType.ERROR);
        expect(response.payload["message"]).toEqual("Error while creating pipe: KeyError(operation)");
    });

    test('should send a valid pipe request and get pipe endpoint along with ok response', async () => {
        const pipe_op_code = "create";
        const pipe_type = "TCP";
        const pipe_name = "p1";
        const pipe_args = {};

        const request = new Request(RequestType.PIPE, {
            "operation": pipe_op_code,
            "pipe_type": pipe_type,
            "pipe_name": pipe_name,
            "args": pipe_args
        });
        const response = await client.sendRequest(request);
        expect(response.type).toEqual(ResponseType.OK);
        expect(response.payload["port"]).toBeGreaterThanOrEqual(40000);
        expect(response.payload["message"]).toEqual(`Pipe ${pipe_name} created`);
    });
});