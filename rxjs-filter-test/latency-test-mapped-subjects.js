const { Subject } = require("rxjs");
const now = require("performance-now");

const { standardObserver, getAverageLatencyOfMessages } = require("./utilities");

/**
 * Measures average latency of messages sent to a bunch of observers. Messages come through
 * a single source Observable/Subject, which then filters those messages via subjectDictionary
 * and directly calls .next() on appropriate subjects (which may or may not have observers).
 * @param {number} subjectCount
 * @param {number} observersPerSubject
 */
const TestLatency_MappingMessageIdsToSubjects = (subjectCount, observersPerSubject) => {
    const completedMessages = [];
    const subjectDictionary = new Map();
    const messageSource = new Subject();
    messageSource.subscribe((message) => {
        // filter to the appropriate subject
        const targetSubject = subjectDictionary.get(message.id);
        if (targetSubject) {
            targetSubject.next(message);
        }
    });

    const getMessageId = (index) => `message-${index}`;

    // Setup subjects and observers
    for (let i = 0; i < subjectCount; ++i) {
        const subject = new Subject();
        for (let j = 0; j < observersPerSubject; ++j) {
            subject.subscribe(standardObserver(completedMessages));
        }

        subjectDictionary.set(getMessageId(i), subject);
    }

    // send out messages
    for (let i = 0; i < subjectCount; ++i) {
        const message = {
            id: getMessageId(i),
            startTime: now()
        }
        messageSource.next(message);
    }

    // process data (get average message latency)
    const averageLatency = getAverageLatencyOfMessages(completedMessages);

    if (global.outputTestLogs) {
        console.log(`================================PreFilterThroughSubject====================================`);
        console.log(`Subjects: ${subjectCount}, ObserversPerSubject: ${observersPerSubject}`);
        console.log(`Total Messages Sent: ${subjectCount}`);
        console.log(`Total Messages Received: ${completedMessages.length} (expected: ObserversPerSubject x Total Subject Count)`);
        console.log(`Average Latency per Message: ${averageLatency}`);

        console.log("Completed Messages:")
        completedMessages.forEach(message => {
            console.log(`${message.id} - s: ${message.startTime}, e: ${message.endTime}`);
        })
        console.log("==========================================================================================");
    }

    return Math.round(averageLatency * 1000) / 1000;
}

module.exports = {
    TestLatency_MappingMessageIdsToSubjects
}
