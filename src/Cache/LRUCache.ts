import { ApiResponseHandler } from "../Middleware/apiResponseMiddleware";
import { Response } from "express";

interface ApiResponse {  
  data?: any;
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

export class LRUCache {
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
  getResponse = (url : string, res : Response) =>{
    if(!this.cacheMap.has(url)){
        console.log("Cache is not stored your request data");
        return;
    }
        const responseData = this.cacheMap.get(url);
        this.markAsMostRecent(responseData as CacheEntry);
        return ApiResponseHandler.success(res, responseData?.response , "success response", 200);
    
  }

  //<-- put ---->
  storeResponse = async (url : string , response : ApiResponse) =>{
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

  //<--- is valid key --->
  keyExists = (url : string)=>{
    return this.cacheMap.has(url);
  }

}
