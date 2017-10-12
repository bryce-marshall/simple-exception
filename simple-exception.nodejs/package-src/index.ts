export interface ExceptionLike extends Error {
    readonly isException: boolean;
    readonly stack: string;
    toString(): string;
}

class _Error extends Error {
    constructor(e: SimpleException, name: string, message?: string) {
        super(message);

        if (Object.getPrototypeOf) {
            let p = Object.getPrototypeOf(e);
            for (let k in p) {
                if (k == "constructor" || k == "message" || k == "stack") continue;
                this[k] = p[k];
            }
        }
        else {
            for (let k in e) {
                if (k == "message" || k == "stack") continue;
                this[k] = e[k];
            }
        }

        this.name = name;
        let evalProp = "is" + name + "Exception";

        if (this[evalProp] == undefined) {
            this[evalProp] = SimpleException.prototype.isException;
        }
    }
}

/**
 * The base class for custom error types implementing the standard ECMAScript Error interface.
 * Instances of this type may be instantiated directly (without subclassing) in order to create custom error instances.
 */
export class SimpleException implements ExceptionLike {
    readonly name: string;
    readonly message: string;
    readonly stack: string;
    /**
     * Creates a new SimpleException instance.
     * @param errorName The name (implied type) of the Error object implemented by this instance.
     * @param message An optional error message.
    */
    constructor(errorName: string, message?: string) {
        if (errorName == null) throw new SimpleException("ArgumentNull", 'The argument "errorName" cannot be null.');

        if (!message)
            message = "Error of type " + errorName;

        return <any>new _Error(this, errorName, message);
    }

    /**
     * Returns the error message associated with this instance.
     */
    public toString(): string {
        let name = this.name;

        if (typeof name != "string")
            name = "Error"
        else if (name !== "Error")
            name += " Error";

        if (typeof this.message == "string" && this.message.length > 0)
            return name + ": " + this.message;

        return this.name;
    }

    /**
     * Always returns true.
     */
    get isException(): boolean {
        return true;
    }

    /**
     * Converts an Error object into an Exception if it is not already.
     * @param error The Error object to convert.
     */
    static convert(error: Error): SimpleException {
        if (error == null) throw new SimpleException("ArgumentNull", 'The argument "error" cannot be null.');
        if (!SimpleException.isError(error)) throw new SimpleException("Argument", 'The argument "error" is invalid.');
        let evalProp = "is" + error.name + "Exception";

        // When called from the Exception contructor, the following is to work-around the Typescript ES5 compiler bug that incorrectly subclasses the Error object resulting in members defined on the immediate subclass being lost.
        // See https://github.com/Microsoft/TypeScript/issues/10166
        if (error["isException"] == undefined) {
            (<any>error)["isException"] = SimpleException.prototype.isException;
            if (error[evalProp] == undefined) // Don't reassign the toString method on native Error instances.
                (<any>error)["toString"] = SimpleException.prototype.toString;
        }

        // For custom exceptions or other subclassed exceptions where the "is...Exception" property has not been defined.
        if (error[evalProp] == undefined) {
            error[evalProp] = SimpleException.prototype.isException;
        }

        return <ExceptionLike>error;
    }

    /**
     * Returns true if the specified instance is an Error object, otherwise returns false.
     * @param value The value to test.
     */
    static isError(value: any) {
        return value && typeof (value.message) == "string" && typeof (value.stack) == "string" && typeof (value.name) == "string";
    }
}
