const { Subject } = require("rxjs");
const now = require("performance-now");

const { standardObserver, getAverageLatencyOfMessages } = require("../utilities");

/**
 * Measures average latency of messages sent to a bunch of observers. Messages come through
 * a single source Observable/Subject, which then filters those messages via observerDictionary
 * and directly calls .next() on appropriate observers. 
 * @param {number} messageIdCount
 * @param {number} observersPerMessageId
 */
const TestLatency_MappingMessageIdsToObserverLists = (messageIdCount, observersPerMessageId) => {
    const completedMessages = [];
    const observerDictionary = new Map();
    const messageSource = new Subject();
    messageSource.subscribe((message) => {
        const observers = observerDictionary.get(message.id);
        if (observers) {
            observers.forEach(observer => observer.next(message));
        }
    });

    const getMessageId = (num) => `messageId-${num}`;

    // Setup observers for each message id
    for (let i = 0; i < messageIdCount; ++i) {
        const observers = [];
        for (let j = 0; j < observersPerMessageId; ++j) {
            observers.push(standardObserver(completedMessages));
        }
        observerDictionary.set(getMessageId(i), observers);
    }

    // send out messages
    for (let i = 0; i < messageIdCount; ++i) {
        const message = {
            id: getMessageId(i),
            startTime: now()
        }
        messageSource.next(message);
    }

    // process data (get average message latency)
    const averageLatency = getAverageLatencyOfMessages(completedMessages);

    if (global.outputTestLogs) {
        console.log(`================================PreFilterDirectToObservers====================================`);
        console.log(`Unique Message Ids: ${messageIdCount}, Observers Per Message Id: ${observersPerMessageId}`);
        console.log(`Total Messages Sent: ${messageIdCount}`);
        console.log(`Total Messages Received: ${completedMessages.length} (expected: ${messageIdCount * observersPerMessageId})`);
        console.log(`Average Latency per Message: ${averageLatency}`);
        console.log("==============================================================================================");
    }

    return Math.round(averageLatency * 1000) / 1000;
}

module.exports = {
    TestLatency_MappingMessageIdsToObserverLists
}