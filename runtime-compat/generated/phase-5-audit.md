# NEA Runtime Compatibility Phase 5 Audit

Generated: 2026-07-30T16:52:51.980Z
Overall status: **complete**

## Requirements

### layered-architecture: complete

Client Script Runtime, Server Script Runtime, MuDB transport and authoritative state are separate layers.

- runtime-compat/abi/runtime-contracts.json: ["project-package","client-script-runtime","server-script-runtime","mudb-transport","authoritative-game-runtime"]
- runtime-compat/abi/script-runtime-boundaries.json: "Client Script Runtime and Server Script Runtime are separate execution realms connected only through declared transport and authoritative state flows."

### machine-readable-api-abi: complete

Every locally documented canonical declaration, kind-qualified member signature and recovered MuDB message has an explicit machine-readable record with availability, compatibility and evidence.

- runtime-compat/generated/api-abi-completeness.json: {"status":"complete","summary":{"documentation":{"entries":599,"memberVariants":602,"byKind":{"method":245,"event":53,"property":265,"global":17,"object":22}},"catalogs":{"client":133,"server":921,"shared":131},"compatibilityMatrix":{"entries":599,"coveredDocumentationEntries":599},"protocols":{"catalogs":32,"messages":180,"byDirection":{"server-to-client":86,"client-to-server":94}},"gaps":0}}
- runtime-compat/abi/compatibility-matrix.json: {"declarations":599,"byStatus":{"native":125,"compatible":50,"partial":57,"recovered-only":145,"unavailable":1,"declared-only":221}}
- runtime-compat/abi/protocols.json: {"protocols":32,"messages":180,"byDirection":{"server-to-client":86,"client-to-server":94}}

### player-standing-body: complete

Historical standing Player body dimensions and body-center coordinates replace the unsupported 0.6x1.8x0.6 assumption.

- runtime-compat/abi/physics-player-body.json: {"origin":"body-center","halfExtents":[0.45,1.1,0.45],"dimensions":[0.9,2.2,0.9],"status":"confirmed-player-bundle-default"}

### player-posture-shapes: complete

Crouch/fly state encoding and client motor behavior are recovered; unavailable historical shapes are explicit null fields and the local runtime preserves the current collider instead of synthesizing dimensions.

- runtime-compat/abi/physics-player-posture.json: {"crouching":{"stateStatus":"confirmed","confirmedClientEffects":["crouch-speed","crouch-acceleration","edge-occupancy-limiting"],"clientShapeMutation":"absent","authoritativeShape":{"status":"evidence-deferred","boundsHalfExtents":null,"shapeHalfExtents":null,"dimensions":null,"wireFields":{"rx":null,"ry":null,"rz":null,"hsx":null,"hsy":null,"hsz":null}}},"flying":{"stateStatus":"confirmed","confirmedClientEffects":["gravity-flag","collision-flag","vertical-motor-force"],"clientShapeMutation":"absent","authoritativeShape":{"status":"evidence-deferred","boundsHalfExtents":null,"shapeHalfExtents":null,"dimensions":null,"wireFields":{"rx":null,"ry":null,"rz":null,"hsx":null,"hsy":null,"hsz":null}}},"compatibilityPolicy":{"onUnknownAuthoritativeShape":"preserve-current-collider","requireCompleteAuthoritativeShape":true,"historicalClaim":false},"captureEvidence":"The explicit captures, inspected Player profile stores, and legacy worktree contain no historical binary server-to-client PUBLIC body frame."}
- runtime-compat/generated/legacy-worktree-posture-inventory.json: {"clientShapeWrites":[],"legacyProducer":"local-reproduction-not-historical-evidence","authoritativeStatus":"unresolved"}
- runtime-compat/generated/posture-delta-corpus-inventory.json: {"captures":9,"clientToServerBinaryFrames":1864,"serverToClientBinaryFrames":0,"resourceArchives":3,"rawReplayPayloadAvailable":false,"status":"not-found-in-safe-local-frame-corpus"}
- runtime-compat/generated/authoritative-runtime-evidence-coverage.json: {"indexedSourceSets":["origin-server-runtime","lokibox-runtime-adapters","local-player-backend","archived-player-bundle","player-browser-profile","legacy-worktree","posture-delta-frame-corpus"],"producerStatus":"not-found-in-indexed-local-evidence","contactBindingStatus":"reference-only"}

### terrain-contact-rules: complete

Terrain contact axes, grounded support selection, force fields and active ContactRecord schemas are recovered.

- runtime-compat/abi/physics-player-body.json: {"wireQuantization":0.00390625,"contactCutoff":0.0009765625,"minimumRadius":0.00390625,"groundedAggregation":"confirmed: voxel axis 2 support plus strongest body contact with non-zero ny","sweep":"predicted body-center position expanded symmetrically by rigid-body rx/ry/rz","narrowphaseShape":"hsx/hsy/hsz are tracked separately from broadphase rx/ry/rz"}
- runtime-compat/abi/contact-event-model.json: {"axis":{"entityWire":"nx/ny/nz are reconstructed directly as GameVector3","voxelWire":"packed axis is passed through origin unpackAxis before event construction","local":"sweep contact normal is exposed as canonical axis and retained as the normal extension alias","packedMapping":{"0":[1,0,0],"1":[-1,0,0],"2":[0,1,0],"3":[0,-1,0],"4":[0,0,1],"5":[0,0,-1]},"status":"confirmed","evidence":[{"path":"Lokibox/box-go/dump/cube-axis.js","confidence":"direct"},{"path":"Lokibox/box-go/custom-schema.ts","confidence":"direct"},{"path":"origin/origin/origin/shell/ScriptShell.js","confidence":"direct"}]},"authoritativeState":{"schema":"ContactIndexSchema = sorted ContactRecordSchema[] by entity id","synchronization":"ScriptEntitySync.preTick applies ContactBinding to state.contact after RigidBodyBinding and DamageBinding","records":{"ContactRecord":["id","body","voxel","fluidVoxels","fluidVolumeFraction"],"BodyContact":["otherId","nx","ny","nz","fx","fy","fz"],"VoxelContact":["x","y","z","b","axis","fx","fy","fz"],"FluidContact":["b","volumeFraction"]},"status":"confirmed-schema-partial-binding","unresolved":["ContactBinding implementation is absent from the recovered origin tree.","The exact GameEntity.contactForce aggregation rule across active contact records is not yet recovered.","The exact construction and reuse policy for active contact value objects is not yet recovered."],"evidence":[{"path":"Lokibox/box-go/dump/cube-axis.js","confidence":"direct"},{"path":"origin/origin/origin/sync/ScriptEntitySync.js","confidence":"direct"}],"conformance":{"status":"covered","fixture":"runtime-compat/conformance/contact-state.mjs","tests":"runtime-compat/test/contact-state-conformance.test.mjs","coveredMappings":["body contact fields","voxel contact fields","fluid contact fields","cube axis decoding"],"excludedMappings":["GameEntity.contactForce aggregation"]}}}

### version-capability-conformance: complete

API version, runtime contracts, side-qualified capabilities, compatibility levels and conformance fixtures are enforced.

- runtime-compat/abi/runtime-contracts.json: {"apiVersion":"0.1.0","contracts":["dao3-client-runtime/v1","nea-server-runtime/v1"]}
- runtime-compat/abi/compatibility-matrix.json: {"native":"Executable in the historical runtime provider with direct evidence.","compatible":"Executable locally with conformance evidence sufficient for the documented contract.","partial":"Executable locally, but one or more access, signature or behavioral gaps remain.","recovered-only":"The historical declaration or implementation is recovered, but no local executable binding exists.","unavailable":"Direct runtime evidence proves that the selected historical provider does not expose this declaration to scripts.","declared-only":"Only the documentation declaration is currently recovered."}

### demo-contract-bindings: complete

Demo client.js and server.js bind separate declared runtime contracts and capabilities.

- runtime-compat/abi/runtime-contracts.json: [{"side":"client","contract":"dao3-client-runtime/v1","resolved":true},{"side":"server","contract":"nea-server-runtime/v1","resolved":true}]

### gap-report: complete

The generated gap report uses the same canonical compatibility matrix classification.

- runtime-compat/generated/gap-report.json: {"executable":232,"compatibilityStatus":{"native":125,"compatible":50,"partial":57,"recovered-only":145,"unavailable":1,"declared-only":221}}

## Deferred Evidence

- player-posture-authoritative-shapes: not-found-in-indexed-local-evidence; blocking=false; representation=evidence-deferred

## Validation

- `cd runtime-compat && npm run build && npm test`
- `cd demo-map && npm run build && npm test`

Policy: Historical behavior is never synthesized. Evidence-deferred fields remain null; a local preserve-current-collider policy may complete the compatibility contract without claiming recovered historical values.
