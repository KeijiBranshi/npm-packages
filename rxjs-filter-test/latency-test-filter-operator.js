const { Subject } = require("rxjs");
const { filter, share } = require("rxjs/operators");
const now = require("performance-now");

const { standardObserver, getAverageLatencyOfMessages } = require("./utilities");

/**
 * Measures latency of messages sent to a bunch of observers. The observers filter and subscribe
 * directly to the source observable that message are coming through. 
 * @param {number} messageIdCount 
 * @param {number} observersPerMessageId 
 */
const TestLatency_FilterOnSharedObservable = (messageIdCount, observersPerMessageId) => {
    const completedMessages = [];
    const messageSource = new Subject();
    const sharedObservable = messageSource.pipe(
        share()
    );

    const getMessageId = (num) => `message-${num}`;

    // Setup observers
    for (let i = 0; i < messageIdCount; ++i) {
        for (let j = 0; j < observersPerMessageId; ++j) {
            sharedObservable
                .pipe(
                    filter((message) => message.id === getMessageId(i)),
                )
                .subscribe(standardObserver(completedMessages));
        }
    }

    // send out message
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
        console.log(`================================PostFilterWithOperator====================================`);
        console.log(`Unique Message Ids: ${messageIdCount}, Observers Per Message Id: ${observersPerMessageId}`);
        console.log(`Total Messages Sent: ${messageIdCount}`);
        console.log(`Total Messages Received: ${completedMessages.length} (expected: Message Ids x Observers Per Message Id)`);
        console.log(`Average Latency per Message: ${averageLatency}`);
        console.log("==========================================================================================");
    }

    return Math.round(averageLatency * 1000) / 1000;
}

module.exports = {
    TestLatency_FilterOnSharedObservable
}