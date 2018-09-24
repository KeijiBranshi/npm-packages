const { of } = require("rxjs");
const { tap } = require("rxjs/operators");

const TestPayload_EditInTap = () => {
    const sample = {
        foo: "foo",
        bar: "bar"
    };
    const observable = of(sample);

    observable
        .pipe(
            tap(payload => {
                payload.foo = "oof"
            })
        )
        .subscribe(payload => {
            console.log(`Payload: ${JSON.stringify(payload)}`);
        });
}

TestPayload_EditInTap();
