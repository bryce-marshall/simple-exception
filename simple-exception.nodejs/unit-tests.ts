import { SimpleException } from './package-src/index';
import { stringFormat } from '@brycemarshall/string-format';

export interface IUnitTest {
    name: string;
    executed: boolean
    passed: boolean;
    error: any;
    execute();
}

export class UnitTest implements IUnitTest {
    private _name: string;
    private _executed: boolean;
    private _passed: boolean;
    private _error: any;

    constructor(name: string, private fn: Function) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    get executed(): boolean {
        return this._executed;
    }

    get passed(): boolean {
        return this._passed;
    }

    get error(): any {
        return this._error;
    }

    execute() {
        console.log("Executing test \"" + this.name + "\"");
        try {
            this.fn();
            this._passed = true;
        }
        catch (e) {
            this._passed = false;
            this._error = e;
        };

        console.log("Passed: " + this._passed);
        if (!this._passed)
            console.log(this._error.message);
        console.log("");
        this._executed = true;
    }
}

const assert = (condition, message?: string) => {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
};

const assertError = (error: Error, expectedType: string, expectedMessage?: string) => {
    console.log('Expected Type: "' + expectedType + '"; Actual Type: "' + error.name + '"');
    if (expectedMessage != null)
        console.log('Expected Message: "' + expectedMessage + '"; Actual Message: "' + error.message + '"');

    assert(error.name == expectedType,
        stringFormat('Unexpected error type. Expected type "{e}", actual type "{a}"', { e: expectedType, a: error.name }));
    if (expectedMessage != null) {
        assert(error.message == expectedMessage,
            stringFormat('Unexpected error message. Expected message "{e}", actual message "{a}"', { e: expectedMessage, a: error.message }));
    }
}


export class UnitTests {
    public tests: IUnitTest[] = null;

    constructor() {
        this.tests = [
            new UnitTest("Application No Message", () => {
                let e = new SimpleException("Application");
                assertError(e, "Application", "Error of type Application");
                assert((<any>e).isApplicationException);

            }),
            new UnitTest("InvalidOperation No Message", () => {
                let e = new SimpleException("InvalidOperation");
                assertError(e, "InvalidOperation");
                assert((<any>e).isInvalidOperationException);
            }),
            new UnitTest("InvalidOperation with Message", () => {
                assertError(new SimpleException("InvalidOperation", "Test invalid op"), "InvalidOperation", "Test invalid op");
            }),
            new UnitTest("ApplicationException eval type", () => {
                try {
                    throw new SimpleException("Application");
                } catch (e) {
                    assert(e.isException, 'e.isException failed');
                    assert(e.isApplicationException), 'e.isApplicationException failed ';
                }
            }),
            new UnitTest("Convert Native Error test", () => {
                try {
                    throw new RangeError();
                } catch (e) {
                    assert(SimpleException.isError(e) === true, "Exception.isError(e) === true failed");
                    assert(UnitTests.isException(e) === false, "Exception.isException(e) === false failed");
                    e = SimpleException.convert(e);
                    assert(SimpleException.isError(e) === true, "Exception.isError(e) === true (2) failed");
                    assert(UnitTests.isException(e) === true, "Exception.isException(e) === true failed");
                    assert(e.isRangeErrorException === true, "e.isRangeErrorException(e) === true failed");
                }
            }),
            new UnitTest("Native Error toString test", () => {
                try {
                    throw new Error();
                } catch (e) {
                    e = SimpleException.convert(e);
                    assert(e.toString() == "Error", 'e.toString() == "Error" failed');
                }
            }),
            new UnitTest("Native Error toString test (with message)", () => {
                try {
                    throw new Error("Message");
                } catch (e) {
                    e = SimpleException.convert(e);
                    assert(e.toString() == "Error: Message", 'e.toString() == "Error: Message" failed');
                }
            }),            
            new UnitTest("Exception toString test (with message)", () => {
                try {
                    throw new SimpleException("InvalidOperation", "Message");
                } catch (e) {
                    assert(e.toString() == "InvalidOperation Error: Message", 'e.toString() == "InvalidOperation Error: Message" failed');
                }
            }),            
        ];
    }

    executeAll() {
        let count = 0;
        let passed = 0;

        for (let test of this.tests) {
            test.execute();
            count++;
            if (test.passed)
                passed++;
        }

        console.log("Executed " + count + " tests: " + passed + " passed, " + (count - passed) + " failed.");
    }

    /**
     * Returns true if the specified instance is an Exception object, otherwise returns false.
     */
    static isException(value: any): boolean {
        return SimpleException.isError(value) && value.isException === true;
    }    
}

