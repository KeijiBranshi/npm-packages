const now = require("performance-now");

const getAverageLatencyOfMessages = (completedMessages) => {
    const totalMessageLatency = completedMessages.reduce(
        (accumulatedLatency, currentMessage) => {
            const currentMessageLatency = 
                currentMessage.endTime - currentMessage.startTime;
            return accumulatedLatency + currentMessageLatency;
        }, 0);
    return (totalMessageLatency / completedMessages.length);
}

const standardObserver = (completedMessagesList) => ({
    next: (message) => {
        completedMessagesList.push({
            id: message.id,
            startTime: message.startTime,
            endTime: now()
        });
    },
    error: () => { },
    complete: () => { }
});

module.exports = {
    getAverageLatencyOfMessages,
    standardObserver
}
