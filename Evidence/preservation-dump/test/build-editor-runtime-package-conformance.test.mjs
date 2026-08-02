import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const builder = await readFile(new URL("../build-editor-runtime-package.mjs", import.meta.url), "utf8");

test("package builder requires the shared evidence-gated terrain converter", () => {
  assert.match(builder, /convertRecoveredVoxelChunks/);
  assert.match(builder, /preflightRecoveredTerrainOrder/);
  assert.match(builder, /orderProofPathArg/);
  assert.match(builder, /maxVoxelCountArg/);
  assert.match(builder, /parseMaxVoxels/);
  assert.match(builder, /assertTerrainBlockIdsInCatalog/);
  assert.match(builder, /assertNativePlayerTerrainShape/);
  assert.match(builder, /loadPreservedBlockCatalogMetadata/);
  assert.doesNotMatch(builder, /const terrain = \[\];/);
  assert.doesNotMatch(builder, /for \(let z = box\.minZ/);
});

test("package builder verifies every client runtime template asset before copying it", () => {
  assert.match(builder, /verifyClientRuntimeAssets/);
  assert.ok(builder.indexOf("verifyClientRuntimeAssets") < builder.indexOf("await cp(runtimeTemplate.clientRuntimeRoot"));
});

test("package builder verifies the bootstrap template before projecting it", () => {
  assert.match(builder, /verifyProjectBootstrapFile/);
  assert.ok(builder.indexOf("verifyProjectBootstrapFile") < builder.indexOf("buildEditorRuntimeProjection"));
});

test("package builder preflights terrain before creating output files", () => {
  assert.ok(builder.indexOf("const terrainPreflight = preflightRecoveredTerrainOrder") < builder.indexOf("await mkdir(outputRoot"));
  assert.ok(builder.indexOf("assertNativePlayerTerrainShape(project.voxels.shape)") < builder.indexOf("await mkdir(outputRoot"));
  assert.ok(builder.indexOf("assertTerrainBlockIdsInCatalog(terrain, templateBlockCatalog.catalog)") < builder.indexOf('writeJson(join(packageRoot, "world", "terrain.json")'));
});

test("package builder derives its optional terrain limit from the recovered voxel shape", () => {
  assert.match(builder, /parseMaxVoxels\(maxVoxelCountArg\) \?\? voxelCapacity\(project\.voxels\.shape\)/);
  assert.match(builder, /function voxelCapacity\(shape\)/);
});

test("package builder preflights recovered project fields before reading package inputs", () => {
  assert.match(builder, /preflightRecoveredProject/);
  assert.ok(builder.indexOf("const projectPreflight = preflightRecoveredProject(project)") < builder.indexOf("const extraProjectInfo"));
  assert.ok(builder.indexOf("projectPreflight.status === \"evidence-blocked\"") < builder.indexOf("await mkdir(outputRoot"));
});

test("package builder rejects a recovered server entry absent from packaged modules", () => {
  assert.match(builder, /assertRecoveredServerScriptEntry\(project\.scriptIndex, serverFiles\)/);
  assert.match(builder, /Recovered server script entry is not packaged/);
  assert.ok(builder.indexOf("assertRecoveredServerScriptEntry(project.scriptIndex, serverFiles)") < builder.indexOf("const serverModules = []"));
});

test("package builder emits the client script contract required by Player admission", () => {
  assert.match(builder, /contract: \{ side: "client", id: "dao3-client-runtime\/v1", apiVersion: "0\.1\.0" \}/);
  assert.ok(builder.indexOf('contract: { side: "client", id: "dao3-client-runtime/v1", apiVersion: "0.1.0" }') < builder.indexOf("const capturedPictureAssets"));
});

test("package builder verifies captured mesh metadata and data content addresses", () => {
  assert.match(builder, /verifyCapturedEngineModel\(asset\?\.hash, engineModelBodyByHash\)/);
  assert.match(builder, /Captured engine model metadata does not match its content address/);
  assert.match(builder, /Captured engine model data does not match its content address/);
  assert.ok(builder.indexOf("const model = await verifyCapturedEngineModel") < builder.indexOf("const projection = buildEditorRuntimeProjection"));
});

test("package builder admits only structurally valid recovered UI trees", () => {
  assert.match(builder, /preflightRecoveredUiTree/);
  assert.match(builder, /const uiTreePreflight = preflightRecoveredUiTree\(project\.uiTree\)/);
  assert.match(builder, /malformed UI tree structure/);
  assert.match(builder, /const recoveredUiState = validateUiTreeBinding\(project\.defaultScreenId, project\.uiTree\)/);
  assert.match(builder, /const validatedUiState = validateUiSource\(\{/);
  assert.ok(builder.indexOf("const validatedUiState = validateUiSource({") < builder.indexOf("await writeJson(join(archiveRoot, clientUiManifestName), validatedUiState)"));
  assert.ok(builder.indexOf("const recoveredUiState = validateUiTreeBinding(project.defaultScreenId, project.uiTree)") < builder.indexOf("await mkdir(outputRoot"));
  assert.ok(builder.indexOf("const uiTreePreflight = preflightRecoveredUiTree(project.uiTree)") < builder.indexOf("await mkdir(outputRoot"));
});

test("package builder binds emitted UI pictures to packaged content assets", () => {
  assert.match(builder, /assertUiPictureAssetsPackaged\(capturedPictureAssets, capturedPictures\.packageAssets\)/);
  assert.match(builder, /Recovered UI picture asset is not bound to packaged content/);
  assert.ok(builder.indexOf("assertUiPictureAssetsPackaged(capturedPictureAssets, capturedPictures.packageAssets)") < builder.indexOf("const clientUiManifestName"));
});

test("package builder binds content-addressed capability assets to its package asset index", () => {
  assert.match(builder, /assertContentAddressedCapabilityAssetsPackaged\(capabilityAssets, packageAssets\)/);
  assert.match(builder, /Content-addressed capability asset is not bound to package asset index/);
  assert.match(builder, /assets: packageAssets/);
});

test("package builder rejects duplicate logical paths before publishing its asset index", () => {
  assert.match(builder, /assertUniquePackageAssetLogicalPaths\(packageAssets\)/);
  assert.match(builder, /Package asset index contains duplicate logical path/);
  assert.ok(builder.indexOf("assertUniquePackageAssetLogicalPaths(packageAssets)") < builder.indexOf('writeJson(join(packageRoot, "assets", "index.json"), { assets: packageAssets })'));
});

test("package builder preserves recovered environment without claiming runtime compatibility", () => {
  assert.match(builder, /preserveRecoveredEnvironment/);
  assert.match(builder, /environment\.json/);
  assert.match(builder, /environmentCompatibility: recoveredEnvironment\.compatibility/);
});

test("package builder preserves recovered feature flags without enabling them", () => {
  assert.match(builder, /preserveRecoveredFeatures/);
  assert.match(builder, /features\.json/);
  assert.match(builder, /featuresCompatibility: recoveredFeatures\.compatibility/);
});

test("package builder records recovered Player configuration only as capability evidence", () => {
  assert.match(builder, /playerEvidence: project\.player/);
  assert.match(builder, /worldSpawnEvidence: spawn/);
  assert.match(builder, /playerBodyEvidence:/);
  assert.match(builder, /normalizeWorldSpawnWithinShape\(project\.player\.initialPosition, shape\)/);
  assert.doesNotMatch(builder, /writeJson\(join\(packageRoot, "world", "player\.json"/);
});

test("package builder maps recovered world physics into admitted public inputs", () => {
  assert.match(builder, /worldConfig: \{ gravity: project\.physics\.gravity, airFriction: project\.physics\.velocityDamping \}/);
  assert.match(builder, /gravity: project\.physics\.gravity,/);
  assert.match(builder, /airFriction: project\.physics\.velocityDamping,/);
  assert.match(builder, /physicsCompatibility: "partial",/);
  assert.match(builder, /deferredPhysicsFields: \["useOBB"\],/);
  assert.match(builder, /deferredProjectFields: \[\{ name: "defaultSkinName", status: "evidence-deferred"/);
});

test("package builder admits recovered entity placement only through its finite-vector boundary", () => {
  assert.match(builder, /normalizeRecoveredEntityPlacement\(node\.value\.position\)/);
  assert.doesNotMatch(builder, /position: vector\(node\.value\.position\)/);
});
