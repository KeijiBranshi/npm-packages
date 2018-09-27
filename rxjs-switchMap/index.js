const { Subject } = require("rxjs");
const { switchMap } = require("rxjs/operators");

const Test = () => {
    const sourceOne = new Subject();
    const sourceTwo = new Subject();

    sourceOne
        .pipe(
            switchMap(
                () => sourceTwo,
                (one, two) => ({ one, two }))
        )
        .subscribe(next => {
            console.log(`Next val: ${next.one}.${next.two}`);
        });

    sourceTwo.next("should not print"); // nothing should be sent
    sourceOne.next("1"); // nothing should be sent
    
    // now things should be sent
    sourceTwo.next("<- should be 1");
    sourceTwo.next("<- should also be 1");

    sourceOne.next("2");
    sourceTwo.next("<- should be 2");
}

Test();