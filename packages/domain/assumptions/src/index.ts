import { DependencyEdgeSchema, type DependencyEdge } from "../../src/contracts.js";
export class DependencyGraph { readonly edges:DependencyEdge[]=[];
 addDependency(edge:DependencyEdge){const v=DependencyEdgeSchema.parse(edge);this.edges.push(v);if(!this.validateAcyclic()){this.edges.pop();throw new Error("Dependency cycle");}return v;}
 findDependants(id:string){const out=new Set<string>(), visit=(n:string)=>this.edges.filter(e=>e.fromNodeId===n).forEach(e=>{if(!out.has(e.toNodeId)){out.add(e.toNodeId);visit(e.toNodeId);}});visit(id);return [...out];}
 validateAcyclic(){const visiting=new Set<string>(),done=new Set<string>(), visit=(n:string):boolean=>{if(visiting.has(n))return false;if(done.has(n))return true;visiting.add(n);for(const e of this.edges.filter(x=>x.fromNodeId===n))if(!visit(e.toNodeId))return false;visiting.delete(n);done.add(n);return true;};return this.edges.every(e=>visit(e.fromNodeId));}
 invalidateFrom(id:string){return this.findDependants(id);}
}
