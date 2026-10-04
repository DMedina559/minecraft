// Transfer UI platform constants. Keep API_VERSION frozen until an explicit release bump.
export const PROVIDER_PROTOCOL=1;
export const API_VERSION="1.0.0";
export const API_LIMITS={maxProviders:32,maxDestinationsPerProvider:512,maxPresencePerProvider:2048,maxGroupsPerProvider:256,maxRelationshipsPerProvider:4096,maxActionsPerProvider:128,maxSectionsPerProvider:128,maxTags:32,maxMetadataChars:8192,maxIpcChars:262144,maxChunks:256,chunkChars:1400,chunkTtlMs:30000,providerStaleMs:90000,providerExpireMs:300000,policyTicks:20,maxRedirects:4,maxQueuedEvents:1024,maxEventsPerTick:8};
export const CAPABILITIES=new Set(["destinations","destination-deltas","presence","presence-deltas","relationships","groups","navigation","actions","policies","health","transfer-lifecycle","transfer-requests","deep-links","metadata","selection","queues","configure"]);
