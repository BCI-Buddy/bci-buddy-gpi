class BciBuddyClient {
    constructor(socketUrl) {
        this.socket = new WebSocket(socketUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        this.socket.onmessage = (event) => {
            console.log('Received message:', event.data);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }

    sendRequest(request) {
        return new Promise((resolve, reject) => {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(request));

                this.socket.onmessage = (event) => {
                    resolve(JSON.parse(event.data));
                };

                this.socket.onerror = (error) => {
                    reject(error);
                };
            } else {
                reject(new Error('WebSocket is not open'));
            }
        });
    }
}

export default BciBuddyClient;