import net from 'net';

class BciBuddyClient {
    constructor(socketUrl) {
        const [host, port] = socketUrl.replace('tcp://', '').split(':');
        this.socket = new net.Socket();
        this.host = host;
        this.port = parseInt(port, 10);
        this.communicationSocket = null;

        this.socket.on('connect', () => {
            console.log('TCP connection established');
        });

        this.socket.on('data', (data) => {
            console.log('Received message:', data.toString());
            this.handleInitializationResponse(data.toString());
        });

        this.socket.on('error', (error) => {
            console.error('TCP error:', error);
        });

        this.socket.on('close', () => {
            console.log('TCP connection closed');
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket.connect(this.port, this.host, () => {
                resolve();
            });

            this.socket.on('error', (error) => {
                reject(error);
            });
        });
    }

    handleInitializationResponse(data) {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'OK' && parsedData.payload && parsedData.payload.endpoint) {
            const [host, port] = parsedData.payload.endpoint.replace('tcp://', '').split(':');
            this.communicationSocket = new net.Socket();
            this.communicationSocket.connect(parseInt(port, 10), host, () => {
                console.log('Connected to communication endpoint');
            });

            this.communicationSocket.on('data', (data) => {
                console.log('Received message from communication endpoint:', data.toString());
            });

            this.communicationSocket.on('error', (error) => {
                console.error('TCP error on communication socket:', error);
            });

            this.communicationSocket.on('close', () => {
                console.log('TCP communication socket closed');
            });
        } else {
            console.error('Invalid initialization response');
        }
    }

    sendRequest(request) {
        return new Promise((resolve, reject) => {
            if (this.communicationSocket && this.communicationSocket.readyState === 'open') {
                this.communicationSocket.write(request.serialize());

                this.communicationSocket.on('data', (data) => {
                    resolve(JSON.parse(data.toString()));
                });

                this.communicationSocket.on('error', (error) => {
                    reject(error);
                });
            } else {
                reject(new Error('TCP communication socket is not open'));
            }
        });
    }
}
export default BciBuddyClient;