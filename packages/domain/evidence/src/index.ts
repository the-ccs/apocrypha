import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { SourceArtifactSchema, type SourceArtifact, type ProjectId } from "../../src/contracts.js";

export class SourceArtifactIngestor {
  constructor(private readonly storageRoot:string) {}
  ingest(projectId:ProjectId, inputPath:string, sourceKind:SourceArtifact["sourceKind"], mediaType:string):SourceArtifact {
    const bytes=readFileSync(inputPath); const sha256=createHash("sha256").update(bytes).digest("hex"); const id=`src_${randomUUID()}`; const dir=join(this.storageRoot,String(projectId)); mkdirSync(dir,{recursive:true}); const storagePath=join(dir,sha256); if (!existsSync(storagePath)) copyFileSync(inputPath,storagePath);
    return SourceArtifactSchema.parse({id,projectId,filename:basename(inputPath),mediaType,byteLength:bytes.length,sha256,storagePath,sourceKind,importedAt:new Date().toISOString(),lifecycle:"ACTIVE"});
  }
}
