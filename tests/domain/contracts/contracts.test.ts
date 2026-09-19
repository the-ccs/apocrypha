import { describe, expect, it } from "vitest";
import { EpistemicClassSchema, EvidenceSelectorSchema, HypothesisDefinitionSchema, ObservationSchema } from "../../../packages/domain/src/index.js";
import { ReconstructionSpecSchema, RenderManifestSchema } from "../../../packages/reconstruction/manifests/src/index.js";

const stamp = "2026-09-19T00:00:00.000Z"; const hash = "a".repeat(64);
describe("canonical contracts",()=>{
  it("rejects invalid epistemic classes",()=>expect(EpistemicClassSchema.safeParse("LIKELY").success).toBe(false));
  it("rejects image coordinates outside normalized bounds",()=>expect(EvidenceSelectorSchema.safeParse({type:"IMAGE_REGION",x:1.1,y:0,width:.1,height:.1,coordinateSpace:"NORMALIZED_0_1"}).success).toBe(false));
  it("rejects overlapping hypothesis dispositions",()=>expect(HypothesisDefinitionSchema.safeParse({id:"hyp_1",label:"H",acceptedClaimIds:["clm_1"],rejectedClaimIds:["clm_1"],unresolvedClaimIds:[],activeAssumptionIds:[],createdAt:stamp}).success).toBe(false));
  it("rejects empty observation evidence",()=>expect(ObservationSchema.safeParse({id:"obs_1",description:"d",evidenceItemIds:[],observationType:"VISUAL",createdAt:stamp,lifecycle:"ACTIVE"}).success).toBe(false));
  it("rejects malformed reconstruction specs",()=>expect(ReconstructionSpecSchema.safeParse({specVersion:"1"}).success).toBe(false));
  it("rejects malformed render manifests",()=>expect(RenderManifestSchema.safeParse({reconstructionId:"rec_1",outputSha256:hash}).success).toBe(false));
});
