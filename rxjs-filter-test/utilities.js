const { cloneDeep } = require("lodash");
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
        const endTime = now();
        const clone = cloneDeep(message); // could this affect other handler's endtime?

        clone.endTime = endTime;
        completedMessagesList.push(clone);
    },
    error: () => { },
    complete: () => { }
});

module.exports = {
    getAverageLatencyOfMessages,
    standardObserver
}
