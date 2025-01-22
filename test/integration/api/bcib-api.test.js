import BciBuddyClient from '../../../src/lib/bcib-api/client';
import message from '../../../src/lib/bcib-api/message';
const { Request, RequestType, Response, ResponseType } = message;

describe('BciBuddyClient TCP socket integration', () => {
    let client;

    beforeEach(async () => {
        client = new BciBuddyClient('tcp://0.0.0.0:2393');
        await client.initialize();
    });

    test('should connect to the server and send a serialized request', async () => {
        await client.connect();
        const request = new Request(RequestType.PING, {});
        const response = await client.sendRequest(request);
        expect(response.type).toEqual(ResponseType.PONG);
        expect(response.payload).toEqual({});
    });
});