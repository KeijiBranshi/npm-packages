const { Subject } = require("rxjs");
const { filter, share, tap } = require("rxjs/operators");
const now = require("performance-now");
const cTable = require("console.table");

const outputTestLogs = false;
const logTestResults = (testName, observersCount, messagesPerObserver, completedMessagesCount, avgMessageLatency) => {
    console.log(`================================${testName}====================================`);
    console.log(`Observers: ${observersCount}, MessagesPerObserver: ${messagesPerObserver}`);
    console.log(`Total Messages Sent: ${observersCount * messagesPerObserver}`);
    console.log(`Total Messages Received: ${completedMessagesCount}`);
    console.log(`Average Latency per Message: ${avgMessageLatency}`);
    console.log("================================================================================");
}

const getObserverId = (num) => {
    return `observer-${num}`;
}

const postFilterTest = (observersCount, messagesPerObserver) => {
    const completedMessages = [];
    const source = new Subject();
    const sharedObservable = source.pipe(
        share()
    );

    // Setup observers
    for (let i = 0; i < observersCount; ++i) {
        sharedObservable
        .pipe(
            filter((message) => message.id === getObserverId(i)),
        )
        .subscribe((message) => {
            message.endTime = now();
            completedMessages.push(message);
        })
    }

    // send out message
    for (let i = 0; i < observersCount; ++i) {
        for (let j = 0; j < messagesPerObserver; ++j) {
            const message = {
                id: getObserverId(i),
                startTime: now()
            }
            source.next(message);
        }
    }

    // process data (get average message latency)
    const totalMessageLatency = completedMessages.reduce(
        (accumulatedLatency, currentMessage) => {
            const currentMessageLatency = 
                currentMessage.endTime - currentMessage.startTime;
            return accumulatedLatency + currentMessageLatency;
        }, 0);
    const averageLatency = totalMessageLatency / completedMessages.length;

    if (outputTestLogs) {
        logTestResults(
            "PostFilterTest", 
            observersCount,
            messagesPerObserver,
            completedMessages.length,
            averageLatency);
    }

    return Math.round(averageLatency * 1000) / 1000;
}

const preFilterTest = (observersCount, messagesPerObserver) => {
    const completedMessages = [];
    const observerDictionary = new Map();
    const source = new Subject();
    source.subscribe((message) => {
        const observer = observerDictionary.get(message.id);
        if (observer) {
            observer.next(message);
        }
    });

    // Setup observers
    for (let i = 0; i < observersCount; ++i) {
        const observer = {
            next: (message) => {
                message.endTime = now();
                completedMessages.push(message);
            },
            error: () => { },
            complete: () => { },
        };
        observerDictionary.set(getObserverId(i), observer);
    }

    // send out message
    for (let i = 0; i < observersCount; ++i) {
        for (let j = 0; j < messagesPerObserver; ++j) {
            const message = {
                id: getObserverId(i),
                startTime: now()
            }
            source.next(message);
        }
    }

    // process data (get average message latency)
    const totalMessageLatency = completedMessages.reduce(
        (accumulatedLatency, currentMessage) => {
            const currentMessageLatency = 
                (currentMessage.endTime - currentMessage.startTime);
            return accumulatedLatency + currentMessageLatency;
        }, 0);
    const averageLatency = totalMessageLatency / completedMessages.length;

    if (outputTestLogs) {
        logTestResults(
            "PreFilterTest", 
            observersCount,
            messagesPerObserver,
            completedMessages.length,
            averageLatency
        );
    }

    return Math.round(averageLatency * 1000) / 1000;
}

// Run test
const observerCounts = [1, 10, 100, 1000, 10000, 100000];
const data = [];
observerCounts.forEach(count => {
    console.log(`Performing Tests for ${count} observers`)
    const postFilterLatency = postFilterTest(count, 1);
    const preFilterLatency = preFilterTest(count, 1);

    data.push({
        ObserverCount: count,
        PostFilterLatency: postFilterLatency,
        PreFilterLatency: preFilterLatency
    });
});

console.table(data);