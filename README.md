# @brycemarshall/exception

A lightweight implementation of the standard ECMAScript Error interface which is compatible with the @brycemarshall/exception Exception type.

## Installation

npm install @brycemarshall/simple-exception

## The module exports the following types:

```ts
export interface ExceptionLike extends Error {
    readonly isException: boolean;
    toString(): string;
}
/**
 * The base class for custom error types implementing the standard ECMAScript Error interface.
 * Instances of this type may be instantiated directly (without subclassing) in order to create custom error instances.
 */
export declare class SimpleException extends Error implements ExceptionLike {
    /**
     * Creates a new SimpleException instance.
     * @param errorName The name (implied type) of the Error object implemented by this instance.
     * @param message An optional error message.
    */
    constructor(errorName: string, message?: string);
    /**
     * Returns the error message associated with this instance.
     */
    toString(): string;
    /**
     * Always returns true.
     */
    readonly isException: boolean;
    /**
     * Converts an Error object into an Exception if it is not already.
     * @param error The Error object to convert.
     */
    static convert(error: Error): ExceptionLike;
    /**
     * Returns true if the specified instance is an Error object, otherwise returns false.
     * @param value The value to test.
     */
    static isError(value: any): boolean;
}
```
## Usage 

```ts
try {
    throw new SimpleException("Timeout");
}
catch (e) {
    if (e.isTimeoutException)
        console.log("Caught a TimeoutException");
}
```
```ts
try {
    throw new SimpleException("Foobar", "Your foo is incompatible with my bar.");
}
catch (e) {
    if (e.isFoobarException)
        console.log("Caught a FoobarException");
}
```
## Usage - Native Error Type Identification

```ts
try {
    throw new RangeError();
}
catch (e) {
    e = SimpleException.convert(e);
    if (e.isRangeErrorException)
        console.log("Caught an Error of type 'RangeError'");
}
```

## Contributors

 - Bryce Marshall

## MIT Licenced
