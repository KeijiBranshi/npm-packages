const { TestLatency_FilterOnSharedObservable } = require("./latency-test-filter-operator");
const { TestLatency_MappingMessageIdsToObserverLists } = require("./latency-test-observer-list");
const { TestLatency_MappingMessageIdsToSubjects } = require("./latency-test-mapped-subjects");

const cTable = require("console.table");

global.outputTestLogs = false;   // flip this to turn off big logs

// Run test
const uniqueMessageIdCounts = [10, 100, 1000];
const observerPerMessageIdCounts = [1, 10, 100];
const data = [];

uniqueMessageIdCounts.forEach(uniqueMessageIdCount => {
    observerPerMessageIdCounts.forEach(observerPerMessageIdCount => {
        const usingRxJsFilterOperator = TestLatency_FilterOnSharedObservable(uniqueMessageIdCount, observerPerMessageIdCount);
        const usingObserverListToFilter = TestLatency_MappingMessageIdsToObserverLists(uniqueMessageIdCount, observerPerMessageIdCount);
        const usingSubjectsToFilter = TestLatency_MappingMessageIdsToSubjects(uniqueMessageIdCount, observerPerMessageIdCount);

        data.push({
            UniqueMessageIds: uniqueMessageIdCount,
            ObserversPerMessageId: observerPerMessageIdCount,
            "FilterOnSharedObservable - Latency": usingRxJsFilterOperator,
            "ObserverList - Latency": usingObserverListToFilter,
            "Subjects - Latency": usingSubjectsToFilter
        })

    })
})

console.table(data);