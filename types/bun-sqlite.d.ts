declare module "bun:sqlite" {
  export class Database {
    constructor(filename: string, options?: { create?: boolean; readonly?: boolean; readwrite?: boolean })
    exec(sql: string): void
    prepare(sql: string): Statement
    query(sql: string): Statement
    close(): void
  }

  export class Statement {
    all(...params: any[]): any[]
    get(...params: any[]): any
    run(...params: any[]): void
    values(...params: any[]): any[][]
  }
}
