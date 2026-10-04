// Consumer-owned topic registry. A topic remains active while at least one consumer owns it.
export class SubscriptionRegistry {
  constructor(){this.consumers=new Map()}
  subscribe(consumerId,topic){consumerId=`${consumerId||"anonymous"}`.trim()||"anonymous";topic=`${topic||""}`.trim();if(!topic)return false;let set=this.consumers.get(consumerId);if(!set){set=new Set();this.consumers.set(consumerId,set)}const added=!set.has(topic);set.add(topic);return added}
  unsubscribe(consumerId,topic){consumerId=`${consumerId||"anonymous"}`.trim()||"anonymous";topic=`${topic||""}`.trim();const set=this.consumers.get(consumerId);if(!set)return false;const existed=set.delete(topic);if(!set.size)this.consumers.delete(consumerId);return existed}
  removeConsumer(consumerId){return this.consumers.delete(`${consumerId||""}`.trim())}
  topics(){const out=new Set();for(const set of this.consumers.values())for(const t of set)out.add(t);return out}
  snapshot(){return Object.fromEntries([...this.consumers].map(([id,set])=>[id,[...set]]))}
}
