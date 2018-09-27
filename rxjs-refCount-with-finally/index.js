// copied from https://stackoverflow.com/questions/45174328/execute-logic-when-rxjs-5-refcount-connects-to-or-unsubscribes-from-source
const { empty, interval } = require("rxjs");
const { concat, finalize, publish, refCount, take, tap } = require("rxjs/operators")

const source = empty()
    .pipe(
        tap(null,null, () => console.log('subscribed')),
        concat(interval(500)),
        finalize(() => console.log('unsubscribed')),
        publish(),
        refCount(),
    );

const sub1 = source
    .pipe(
        take(5)
    )
    .subscribe(
        val => console.log('sub1 ' + val),
        null, 
        () => console.log('sub1 completed')
    );
const sub2 = source
    .pipe(
        take(3)
    )
    .subscribe(
        val => console.log('sub2 ' + val), 
        null, 
        () => console.log('sub2 completed')
    );

// simulate late subscription setting refCount() from 0 to 1 again                      
setTimeout(() => {
  source
    .pipe(
        take(1)
    )
    .subscribe(
        val => console.log('late sub3 val: ' + val),
        null, 
        () => console.log('sub3 completed')
      );
}, 4000);