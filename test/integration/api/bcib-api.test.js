import BciBuddyClient from '../../../src/lib/bcib-api/client';
import { Request, RequestType, Response, ResponseType } from '../../../src/lib/bcib-api/message';

describe('BciBuddyClient TCP socket integration', () => {
    let client;

    beforeEach(() => {
        client = new BciBuddyClient('tcp://0.0.0.0:2392');
    });

    test('should connect to the server and send a serialized request', async () => {
        const request = new Request(RequestType.PING, { key: 'value' });
        const serializedRequest = request.serialize().toString();
        console.log(`Serialized Request: ${serializedRequest}`);

        await client.connect();

        const responsePromise = client.sendRequest(request);

        const result = await responsePromise;

        console.log(`Received Response: ${JSON.stringify(result)}`);
        expect(result.type).toEqual(ResponseType.OK);
        expect(result.payload.result).toEqual('success');
    });

    test('should reject with an error when TCP socket encounters an error', async () => {
        const error = new Error('TCP error');
        client.socket.on('error', (err) => {
            throw err;
        });

        const promise = client.connect();

        client.socket.emit('error', error);

        await expect(promise).rejects.toThrow('TCP error');
    });

    test('should reject with an error when TCP socket is not open', async () => {
        client.socket.readyState = 'closed';

        await expect(client.connect()).rejects.toThrow('TCP socket is not open');
    });
});