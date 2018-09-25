const { ReplaySubject } = require("rxjs");
const { distinctUntilChanged } = require("rxjs/operators");

const Test = () => {
    const source = new ReplaySubject(1);
    const distinctSource = source.pipe(distinctUntilChanged());

    distinctSource.subscribe(next => {
        console.log(`Sub 1: ${next}`)
    });

    source.next(1);
    source.next(2);

    distinctSource.subscribe(next => {
        console.log(`Sub 2: ${next}`)
    });

    source.next(3);
    source.next(3);

    distinctSource.subscribe(next => {
        console.log(`Sub 3: ${next}`);
    });

    distinctSource.subscribe(next => {
        console.log(`Sub 4: ${next}`);
    })
}

Test();