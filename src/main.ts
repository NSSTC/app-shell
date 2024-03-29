import { Console } from 'console';
import { createInterface, ReadLine } from 'readline';
import { EOL } from "os";
import { Readable, Writable } from 'stream';

import { Err, None, Ok, Option, Result, Some } from "@usefultools/monads";

import * as API from './api';


export class AppShell implements API.IAppShell {
    private cmdHandlers: Map<string, API.ICommandHandler>;
    private console: Option<Console>;
    private readLine: Option<ReadLine>;

    constructor() {
        this.cmdHandlers = new Map();
        this.console = None;
        this.readLine = None;
    }

    register(handler: API.ICommandHandler): Result<void, API.ECommandHandlerError> {
        if (this.cmdHandlers.has(handler.name)) {
            return Err(API.ECommandHandlerError.AlreadyExists);
        }

        this.cmdHandlers.set(handler.name, handler);

        return Ok(undefined);
    }

    async parseLine(line: string): Promise<void> {
        const tokens = line.split(' ');
        const command = tokens.shift() || '';

        if (!this.cmdHandlers.has(command)) {
            throw new Error(API.ECommandHandlerError.UnknownCommand);
        }

        // @ts-ignore we already checked if the handler exists
        await this.cmdHandlers.get(command).handler.call(this, tokens);
    }

    startShell(inStream: Readable, outStream: Writable): Result<void, API.ECommandHandlerError> {
        if (this.console.is_some() || this.readLine.is_some()) {
            return Err(API.ECommandHandlerError.AlreadyStarted);
        }

        this.console = Some(new Console(outStream, outStream));
        this.readLine = Some(createInterface({
            completer: (line: string) => {
                // todo: create more sophisticated mechanism, for example with substring matches

                const commands = Array.from(this.cmdHandlers.keys());
                const hits = commands.filter(c => c.startsWith(line));

                return [hits.length ? hits : commands, line];
            },
            crlfDelay: Infinity,
            input: inStream,
            output: outStream,
        }));

        this.readLine.unwrap().on('line', input => {
            const result = this.parseLine(input.toString());

            result.catch(err => {
                // todo: emit error or log to console
                if (this.console.is_some()){
                    this.console.unwrap().error(err);
                }
            });

            if (this.readLine.is_some()) {
                this.readLine.unwrap().prompt();
            }
        });

        this.readLine.unwrap().prompt();

        return Ok(undefined);
    }

    stopShell(): void {
        if (this.console.is_some()) {
            this.console.unwrap().log(EOL);
            this.console = None;
        }

        if (this.readLine.is_some()) {
            this.readLine.unwrap().close();
            this.readLine = None;
        }
    }

    clearOutput(): void {
        if (this.console.is_some()) {
            this.console.unwrap().clear();
        }
    }

    write(str: string): void {
        if (this.console.is_some()) {
            this.console.unwrap().log(str);
        }
    }
}
