import { Readable, Writable } from 'stream';

import { Result } from "@usefultools/monads";


export enum ECommandHandlerError {
    AlreadyExists = 'Error: Already exists',
    AlreadyStarted = 'Error: Already started',
    UnknownCommand = 'Error: Command unknown',
}

export interface ICommandHandler {
    name: string,
    handler: (args: string[]) => Result<void, any>;
}

export interface IAppShell {
    clearOutput(): void;
    parseLine(line: string): Promise<void>;
    register(handler: ICommandHandler): Result<void, ECommandHandlerError>;
    startShell(inStream: Readable, outStream: Writable): Result<void, ECommandHandlerError>;
    stopShell(): void;
    write(str: string): void;
}
