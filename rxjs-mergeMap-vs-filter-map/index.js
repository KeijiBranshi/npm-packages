const { Subject, empty, of } = require("rxjs");
const { mergeMap, filter, map } = require("rxjs/operators");
const now = require("performance-now");
const cTable = require("console.table");

const FilterMap = (ids, passId) => {
    const source = new Subject();
    const latencies = [];

    // console.log("FM: Subscribing to source");
    source.pipe(
        filter(message => message.id === passId),
        map(message => message.startTime)
    ).subscribe(startTime => {
        const endTime = now();
        latencies.push((endTime - startTime))
    });

    // console.log("FM: Emitting messages");
    ids.forEach(id => {
        source.next({
            id,
            startTime: now()
        })
    });

    // console.log(`FM: Calculating total latency ${JSON.stringify(latencies)}`);
    const totalLatency = latencies.reduce((accumlated, current) => (accumlated + current));
    // console.log(`FM: Calculating Average (Total: ${totalLatency}`);
    const average = (totalLatency / latencies.length);

    // console.log("FM: returning result");
    return Math.round(average * 10000) / 10000;
}

const MergeMap = (ids, passId) => {
    const source = new Subject();
    const latencies = [];

    // /console.log("MM: Subscribing to source");
    source.pipe(
        mergeMap(message => {
            return message.id === passId
            ? of(message.startTime)
            : empty()
        })
    ).subscribe(startTime => {
        const endTime = now();
        latencies.push((endTime - startTime))
    });

    // console.log("MM: Emitting messages");
    // run test
    ids.forEach(id => {
        source.next({
            id,
            startTime: now()
        });
    });


    // get average
    // console.log("MM: Calculating total latency");
    const totalLatency = latencies.reduce((accumlated, current) => (accumlated + current));
    // console.log("MM: Calculating Average");
    const average = (totalLatency / latencies.length);

    // console.log("MM: returning result");
    return Math.round(average * 10000) / 10000;
}

// Tests
const passId = "pass";
const failId = "fail";

const TestAllPass = () => {
    // console.log("Generate ids");
    const ids = [];

    for (let i = 0; i < 1000; ++i) {
        ids.push(passId);
    }

    // console.log("Getting Average FilterMap");
    const avgFilterMapLatency = FilterMap(ids, passId);

    // console.log("Getting Average for MergeMap")
    const avgMergeMapLatency = MergeMap(ids, passId);

    return {
        Test: "AllPasses",
        FilterMap: avgFilterMapLatency,
        MergeMap: avgMergeMapLatency
    };
}

const TestRandomPass = () => {
    // console.log("Generate ids");
    const ids = [];

    for (let i = 0; i < 1000; ++i) {
        const id = (Math.random() % 2) ? passId : failId
        ids.push(id);
    }

    // console.log("Getting Average Latencies");
    const avgFilterMapLatency = FilterMap(ids, passId);
    const avgMergeMapLatency = MergeMap(ids, passId);

    return {
        Test: "RandomPasses",
        FilterMap: avgFilterMapLatency,
        MergeMap: avgMergeMapLatency
    };
}

const TestRandomThirdPass = () => {
    // console.log("Generate ids");
    let ids = [];

    for (let i = 0; i < 1000; ++i) {
        const id = (Math.random() % 3) ? passId : failId
        ids.push(id);
    }

    // console.log("Getting Average Latencies");
    const avgFilterMapLatency = FilterMap(ids, passId);
    const avgMergeMapLatency = MergeMap(ids, passId);

    return {
        Test: "RandomThirdPasses",
        FilterMap: avgFilterMapLatency,
        MergeMap: avgMergeMapLatency
    };
}

const data = [];
data.push(TestAllPass());
data.push(TestRandomPass());
data.push(TestRandomThirdPass());

console.table(data);
