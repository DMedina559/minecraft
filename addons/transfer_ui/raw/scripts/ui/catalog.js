export function pageRows(rows,page=0,size=20){
  const pages=Math.max(1,Math.ceil(rows.length/size));page=Math.max(0,Math.min(pages-1,Number(page)||0));
  return {rows:rows.slice(page*size,(page+1)*size),page,pages,total:rows.length};
}
export function pageButtons(form,paging,navigate){
  form.label(`Page ${paging.page+1}/${paging.pages} • ${paging.total} result(s)`);
  if(paging.page>0)form.button("Previous Page",()=>navigate(paging.page-1));
  if(paging.page+1<paging.pages)form.button("Next Page",()=>navigate(paging.page+1));
}
export function filterDestinations(rows,{query="",online=false,capacity=false,region="",gameMode="",sort="name"}={},available=()=>true){
  const q=query.trim().toLowerCase();
  const filtered=rows.filter(n=>[n.name,n.description,n.region,n.gameMode,...(n.tags??[])].join(" ").toLowerCase().includes(q)&&(!online||available(n))&&(!capacity||n.providerMeta?.maxPlayers==null||Number(n.providerMeta.players)<Number(n.providerMeta.maxPlayers))&&(!region||String(n.region??"").toLowerCase().includes(region.toLowerCase()))&&(!gameMode||String(n.gameMode??"").toLowerCase().includes(gameMode.toLowerCase())));
  return filtered.sort((a,b)=>sort==="players"?Number(a.providerMeta?.players??0)-Number(b.providerMeta?.players??0)||a.name.localeCompare(b.name):sort==="order"?Number(a.order??0)-Number(b.order??0)||a.name.localeCompare(b.name):a.name.localeCompare(b.name));
}
