import { ClaimRelationSchema, ClaimSchema, EvidenceItemSchema, ObservationSchema, type Claim, type ClaimRelation, type EvidenceItem, type Observation } from "../../src/contracts.js";
export class EvidenceClaimGraph {
  readonly evidence=new Map<string,EvidenceItem>(); readonly observations=new Map<string,Observation>(); readonly claims=new Map<string,Claim>(); readonly relations=new Map<string,ClaimRelation>();
  addEvidence(value:EvidenceItem){const v=EvidenceItemSchema.parse(value);this.evidence.set(v.id,v);return v;}
  addObservation(value:Observation){const v=ObservationSchema.parse(value);if(v.evidenceItemIds.some(id=>!this.evidence.has(id)))throw new Error("Observation references missing evidence");this.observations.set(v.id,v);return v;}
  addClaim(value:Claim){const v=ClaimSchema.parse(value);if(v.observationIds.some(id=>!this.observations.has(id)))throw new Error("Claim references missing observation");this.claims.set(v.id,v);return v;}
  addRelation(value:ClaimRelation){const v=ClaimRelationSchema.parse(value);if(!this.claims.has(v.fromClaimId)||!this.claims.has(v.toClaimId))throw new Error("Relation references missing claim");this.relations.set(v.id,v);return v;}
}
