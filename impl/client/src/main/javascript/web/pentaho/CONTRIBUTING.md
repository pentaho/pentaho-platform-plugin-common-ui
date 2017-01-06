# Coding guidelines

## Documentation vs validation of arguments and operations

The documentation specifies the contract the developer is supposed to follow.
Developers are however human, and are therefore susceptible to err and to disobey.
As developers might not follow the contract exactly
(whatever the reasons), it is necessary to have the code validate some of its input.

Adding an excessive amount of code just for validating purposes incurs in a performance penalty.
Validation should therefore be restricted to catching frequent errors or those that might be generated circumstantially
in complex scenarios.

As a first rule, when throwing exceptions, use the error factories exported by the private
module `pentaho/util/error` as much as possible.

### On when to use `argInvalidType` and `argRequired`:
- already documented in an argument's tag
- sometimes these are actually implemented and thrown — but simply because it helps catch common programming bugs faster
- a `@throws` clause would be redundant and would document a circumstantial extra-precaution being taken
- if we implement the error, we need to test it as well (or coverage drops), but that doesn't mean we need to document it

When implemented, these are like assertions:
- if the code were compiled, most cases would be caught at compile time
- if the code were compiled, most errors would never reach a `try`/`catch`
- there is a gotcha in these two statements: to catch nully at compile time, the compiler would need to perform "null analysis", something which is hard to perform
- however, the main and relevant distinction is between good use and bad use of a contract: errors thrown in the course of good/acceptable/unforseeable use are documented and can/should be handled by callers, while errors thrown in the course of bad use (invalid program) are not.
- this is akin to how in Java only some types of errors are required to be part of method signatures
- last, but not the least, it would be overkill to document these errors; it would be lengthy, and it would actually feel redundant.

Therefore:
- as a general rule, no need to implement or document these
- implement only if the scenario is expected to occur frequently,

### On when to use `argInvalid` and `operInvalid`
These conditions depend on the flow of the program and the state of its objects and are utterly impossible to detect at compile time.
Mostly these will still be considered the result of a "bad program".

Therefore:
- implement, using `throw`
- document using `@throws`


### On "timeout", "user validation", ...?
These conditions generally depend on state and actions that are external to the program and whose occurrence it thus can't control or foresee, but only expect and prepare for.

Therefore:
- implement, using `throw`
- document using `@throws`

### On methods that return promises
If a method is supposed to return a promise, and some error is thrown during the execution of the promise,
then the associated promise is rejected with the exception passed as its `reason` argument.

However, if there is some validation taking place before the `new Promise(...)`
block is reached, then there is the possibility that some `throw` statement interrupts the flow of execution.

In other words, we would need to have two mechanisms for handling exceptions: a synchronous `try`/`catch`
and an asynchronous handling of a rejected promise.

It is preferable to use a single mechanism for handling exceptions.

Therefore:
- do not use `throw`, use `Promise.reject`

### Questions that might need further discussion:
- how do we document rejected promises?
- should we start using `@throws` now, or do it all in a full replace to the codebase?