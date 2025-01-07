interface ApiResponse {  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

class CacheEntry {
  url: string;
  response: ApiResponse;

  prevEntry: CacheEntry | null;
  nextEntry: CacheEntry | null;

  constructor(url: string, response: ApiResponse) {
    this.url = url;
    this.response = response;
    this.prevEntry = null;
    this.nextEntry = null;
  }
}

class LRUCache {
   capacity: number;
   cacheMap : Map<string, CacheEntry>;
   mostRecentEntry : CacheEntry | null;
   leastRecentEntry : CacheEntry | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cacheMap = new Map();
    this.mostRecentEntry = null;
    this.leastRecentEntry = null;
  }

  //<--add to front ---->
  private addToMostRecent = (newEntry: CacheEntry)=>{
    newEntry.nextEntry = this.mostRecentEntry;
    newEntry.prevEntry = null;

    if(this.mostRecentEntry != null){
        this.mostRecentEntry.prevEntry = newEntry;
    }

    this.mostRecentEntry = newEntry;

    if(this.leastRecentEntry == null){
        this.leastRecentEntry = newEntry;
    }
  }

  //<-- move to front ---->
  markAsMostRecent = (entry: CacheEntry) =>{
    if(entry == this.mostRecentEntry) return;
    this.removeEntry(entry);
    this.addToMostRecent(entry);
  }

  //<-- remove---->
  removeEntry = (entry: CacheEntry)=>{
    if(entry.prevEntry != null){
        entry.prevEntry.nextEntry = entry.nextEntry;
    }else{
      this.mostRecentEntry = entry.nextEntry;
    }

    if(entry.nextEntry != null){
        entry.nextEntry.prevEntry = entry.prevEntry;
    }else{
      this.leastRecentEntry = entry.prevEntry;
    }
  }

  //<-- remove from rear---->
  evictLeastRecent = ()=>{
    if(this.leastRecentEntry == null) return;


    this.cacheMap.delete(this.leastRecentEntry.url);


    if(this.leastRecentEntry.prevEntry != null){
        this.leastRecentEntry.prevEntry.nextEntry = null;
    }else{
        this.mostRecentEntry = null;
    }

    this.leastRecentEntry = this.leastRecentEntry.prevEntry;

  }

  //<-- get ---->
  getResponse = (url : string) =>{
    if(!this.cacheMap.has(url)){
        console.log("Cache is not stored your request data");
        //next(); allow access to fetch data from database
    }
        const responseData = this.cacheMap.get(url);
        this.markAsMostRecent(responseData as CacheEntry);
        return responseData?.response;
    
  }

  //<-- put ---->
  storeResponse = (url : string , response : ApiResponse) =>{
    if(this.cacheMap.has(url)){
        const entry  = this.cacheMap.get(url);
        this.markAsMostRecent(entry as CacheEntry);
    }else{
        const newEntry  = new CacheEntry(url , response);

        if (this.cacheMap.size >= this.capacity) {
            this.evictLeastRecent();
        }
        
        this.cacheMap.set(url,newEntry);
        this.addToMostRecent(newEntry);
    }
  }

}
