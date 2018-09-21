const { TestLatency_FilterOnSharedObservable } = require("./latency-tests/filter-operator");
const { TestLatency_MappingMessageIdsToObserverLists } = require("./latency-tests/observer-list");
const { TestLatency_MappingMessageIdsToSubjects } = require("./latency-tests/mapped-subjects");

const cTable = require("console.table");
const fs = require("fs");

global.outputTestLogs = false;   // flip this to turn off big logs

// Setup independent Variables (x, y)
const uniqueMessageIdCounts = [10, 100, 200, 500, 1000];
const observersPerMessageIdCounts = [1, 2, 4, 8, 16, 32, 64];
const data = [];

// Run through independent variables 
uniqueMessageIdCounts.forEach(uniqueMessageIds => {
    observersPerMessageIdCounts.forEach(observersPerMessageId => {
        // Compute dependent variables (z)
        const usingRxJsFilterOperator = TestLatency_FilterOnSharedObservable(uniqueMessageIds, observersPerMessageId);
        const usingObserverListToFilter = TestLatency_MappingMessageIdsToObserverLists(uniqueMessageIds, observersPerMessageId);
        const usingSubjectsToFilter = TestLatency_MappingMessageIdsToSubjects(uniqueMessageIds, observersPerMessageId);

        data.push({
            UniqueMessageIds: uniqueMessageIds,                     // x
            ObserversPerMessageId: observersPerMessageId,           // y
            LatencyOfFilterOperator: usingRxJsFilterOperator,       // z1
            LatencyOfObserverList: usingObserverListToFilter,       // z2
            LatencyOfSubjects: usingSubjectsToFilter                // z3
        })

    })
})

// console.log as a nicely formatted table
console.table(data);

// minify data for output to a file
const now = new Date();
const minifiedData = data.map(result => ({
    id: result.UniqueMessageIds,
    ob: result.ObserversPerMessageId,
    fo: result.LatencyOfFilterOperator,
    obl: result.LatencyOfObserverList,
    sj: result.LatencyOfSubjects
}));

// write to file
fs.writeFile(`./results/${now.getFullYear()}${now.getMonth()}${now.getDate()}-${now.getTime()}.json`, JSON.stringify(minifiedData), (err) => {
    if (err) {
        return console.log("Error writing to file.");
    }

    console.log("Wrote to file.");
});