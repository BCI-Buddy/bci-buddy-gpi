import net from 'net';


class BciBuddyClient {
    constructor(socketUrl) {
        this.socketUrl = socketUrl;
        this.socket = new net.Socket();
        this.communicationSocket = null;
    }

    async initialize() {
        const [host, port] = this.socketUrl.replace('tcp://', '').split(':');
        this.host = host;
        this.port = parseInt(port, 10);

        this.socket.on('connect', () => {
            // console.log('TCP connection established');
        });

        this.socket.on('data', (data) => {
            // console.log('Received message:', data.toString());
            this.handleInitializationResponse(data.toString());
        });

        this.socket.on('error', (error) => {
            console.error('TCP error:', error);
        });

        this.socket.on('close', () => {
            // console.log('TCP connection closed');
        });

        await this.connect();
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
            this.socket.destroy(); // Close the initial socket
            this.communicationSocket = new net.Socket();
            this.communicationSocket.connect(parseInt(port, 10), host, () => {
                // console.log('Connected to communication endpoint');
                this.communicationSocketReady = true;
            });

            this.communicationSocket.on('data', (data) => {
                // console.log('Received message from communication endpoint:', data.toString());
                this.communicationSocketResponse = data.toString();
            });

            this.communicationSocket.on('error', (error) => {
                console.error('TCP error on communication socket:', error);
            });

            this.communicationSocket.on('close', () => {
                // console.log('TCP communication socket closed');
            });
        } else {
            console.error('Invalid initialization response');
        }
    }

    async sendRequest(request) {
        if (!this.communicationSocketReady) {
            await new Promise((resolve) => {
                const checkSocketReady = setInterval(() => {
                    if (this.communicationSocketReady) {
                        clearInterval(checkSocketReady);
                        resolve();
                    }
                }, 100);
            });
        }

        return new Promise((resolve, reject) => {
            if (this.communicationSocket.readyState === 'open') {
                const serializedRequest = request.serialize();
                this.communicationSocket.write(serializedRequest);

                this.communicationSocket.on('data', (data) => {
                    resolve(JSON.parse(data.toString()));
                });

                this.communicationSocket.on('error', (error) => {
                    reject(error);
                });
            } else {
                reject(new Error('TCP socket is not open'));
            }
        });
    }
}


export default BciBuddyClient;