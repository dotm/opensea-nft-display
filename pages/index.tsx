import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { CollectionItemData, GetCollectionData } from './api/getCollection';

export default function Home() {
  const [loading, setLoading] = useState(false)
  const collectionUrlPrefix = "https://opensea.io/collection/"
  const [collectionUrlSuffix, setCollectionUrlSuffix] = useState("")
  const [collectionItems, setCollectionItems] = useState<CollectionItemData[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [nextPageCursor, setNextPageCursor] = useState("")

  async function getCollectionDataFromOpenSea(nextPageCursor: string | undefined = undefined){
    setLoading(true)
    if(nextPageCursor === undefined){
      setHasNextPage(false)
      setNextPageCursor("")
    }
    let suffix = collectionUrlSuffix
    if(suffix.startsWith(collectionUrlPrefix)){
      suffix.split(collectionUrlPrefix)[1]
    }
    let url = `/api/getCollection?collectionUrlSuffix=${collectionUrlSuffix}`
    if(nextPageCursor){
      url += `&cursor=${nextPageCursor}`
    }
    const response = await fetch( url, { method: "GET" } );
    const respJson: GetCollectionData = await response.json();
    if(respJson.error !== undefined && respJson.error !== null){
      alert(respJson.error)
      setLoading(false)
      return
    }
    if(nextPageCursor === undefined){
      setCollectionItems(respJson.collectionItems)
    }else{
      setCollectionItems([...collectionItems, ...respJson.collectionItems])
    }
    setHasNextPage(respJson.nextPageCursor !== undefined)
    setNextPageCursor(respJson.nextPageCursor ?? "")

    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div>
        <label htmlFor="opensea-collection" className="block text-sm font-medium leading-6 text-gray-900">
          Display NFT Collection
        </label>
        <div className='sm:hidden mt-2 mb-[-10px]'>
          <p className='text-center text-gray-500'>{collectionUrlPrefix+"[input-this-part]"}</p>
        </div>
        <div className="mt-2 flex flex-wrap rounded-md shadow-sm">
          <span className="hidden sm:inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500 sm:text-sm">
            {collectionUrlPrefix}
          </span>
          <input
            type="text"
            name="opensea-collection"
            id="opensea-collection"
            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md sm:rounded-none border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="s16nftofficial"
            value = {collectionUrlSuffix}
            onChange={(event) => setCollectionUrlSuffix(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter' && !loading) {
                getCollectionDataFromOpenSea()
              }
            }}
          />
          <button
            type="button"
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-200 disabled:text-gray-500"
            onClick={()=>{
              getCollectionDataFromOpenSea()
            }}
            disabled={loading}
          >
            <MagnifyingGlassIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Search
          </button>
        </div>
      </div>
      {
        collectionItems.length === 0 ? <></> :
        <div className="text-center shadow-md my-3 mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8 bg-white">
          <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {collectionItems.map((item) => (
              <li key={item.tokenId} className="relative">
                <a target='_blank' href={`https://opensea.io/assets/ethereum/${item.contractAddress}/${item.tokenId}`}>
                  <div className="group aspect-h-10 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt="" className="pointer-events-none object-cover group-hover:opacity-75" />
                  </div>
                  <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="pointer-events-none block text-sm font-medium text-gray-500">{item.ethPrice}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      }
      {
        hasNextPage ?
        <div className="text-center shadow-md mt-3 mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8 bg-white">
          <button
            type="button"
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-200 disabled:text-gray-500"
            onClick={()=>{
              getCollectionDataFromOpenSea(nextPageCursor)
            }}
            disabled={loading}
          >
            <ArrowDownIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Get Next Page
          </button>
        </div>
        : <></>
      }
    </div>
  )
}