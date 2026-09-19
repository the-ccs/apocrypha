import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export class SqlitePersistence {
  readonly db: DatabaseSync;
  constructor(path = ":memory:") { this.db = new DatabaseSync(path); this.db.exec("PRAGMA foreign_keys = ON"); }
  migrate(): void { const sql = readFileSync(join(import.meta.dirname, "migrations", "001_initial.sql"), "utf8"); this.db.exec(sql); this.db.prepare("INSERT OR IGNORE INTO migrations VALUES (?, ?)").run("001_initial", new Date().toISOString()); }
  put(table:string, id:string, value:unknown): void { this.db.prepare(`INSERT INTO ${table} (id, json) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET json=excluded.json`).run(id, JSON.stringify(value)); }
  get<T>(table:string,id:string):T|undefined { const row=this.db.prepare(`SELECT json FROM ${table} WHERE id=?`).get(id) as {json:string}|undefined; return row ? JSON.parse(row.json) as T : undefined; }
  transaction<T>(work:()=>T):T { this.db.exec("BEGIN"); try { const value=work(); this.db.exec("COMMIT"); return value; } catch(error) { this.db.exec("ROLLBACK"); throw error; } }
  close():void { this.db.close(); }
}

export class SourceArtifactRepository {
  constructor(private readonly persistence:SqlitePersistence) {}
  create(value:{id:string;projectId:string;sha256:string} & Record<string,unknown>):void { this.persistence.db.prepare("INSERT INTO source_artifacts (id,project_id,sha256,json) VALUES (?,?,?,?)").run(value.id,value.projectId,value.sha256,JSON.stringify(value)); }
  get<T>(id:string):T|undefined { const row=this.persistence.db.prepare("SELECT json FROM source_artifacts WHERE id=?").get(id) as {json:string}|undefined; return row?JSON.parse(row.json) as T:undefined; }
}
