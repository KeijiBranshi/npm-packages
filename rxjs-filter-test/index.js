const { TestLatency_FilterOnSharedObservable } = require("./latency-tests/filter-operator");
const { TestLatency_MappingMessageIdsToObserverLists } = require("./latency-tests/observer-list");
const { TestLatency_MappingMessageIdsToSubjects } = require("./latency-tests/mapped-subjects");

const cTable = require("console.table");
const fs = require("fs");

global.outputTestLogs = false;   // flip this to turn off big logs

// Run test
const uniqueMessageIdCounts = [10, 100];
const observerPerMessageIdCounts = [1, 10];
const data = [];

uniqueMessageIdCounts.forEach(uniqueMessageIdCount => {
    observerPerMessageIdCounts.forEach(observerPerMessageIdCount => {
        const usingRxJsFilterOperator = TestLatency_FilterOnSharedObservable(uniqueMessageIdCount, observerPerMessageIdCount);
        const usingObserverListToFilter = TestLatency_MappingMessageIdsToObserverLists(uniqueMessageIdCount, observerPerMessageIdCount);
        const usingSubjectsToFilter = TestLatency_MappingMessageIdsToSubjects(uniqueMessageIdCount, observerPerMessageIdCount);

        data.push({
            UniqueMessageIds: uniqueMessageIdCount,
            ObserversPerMessageId: observerPerMessageIdCount,
            LatencyOfFilterOperator: usingRxJsFilterOperator,
            LatencyOfObserverList: usingObserverListToFilter,
            LatencyOfSubjects: usingSubjectsToFilter
        })

    })
})

console.table(data);

const now = new Date();
const minifiedData = data.map(result => ({
    id: result.UniqueMessageIds,
    ob: result.ObserversPerMessageId,
    fo: result.LatencyOfFilterOperator,
    obl: result.LatencyOfObserverList,
    sj: result.LatencyOfSubjects
}));

fs.writeFile(`./results/${now.getFullYear()}${now.getMonth()}${now.getDate()}-${now.getTime()}.json`, JSON.stringify(minifiedData), (err) => {
    if (err) {
        return console.log("Error writing to file.");
    }

    console.log("Wrote to file.");
});