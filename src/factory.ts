import {
  CreatePairERC1155ERC20Call,
  CreatePairERC1155ETHCall,
  CreatePairERC721ERC20Call,
  CreatePairERC721ETHCall,
  NewERC1155Pair,
  NewERC721Pair
} from "../generated/LSSVMPairFactory/LSSVMPairFactory"
import { Pair, Collection, PairOwner, Token } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { LSSVMPair as PairTemplate, ERC721 as ERC721Template, ERC1155 as ERC1155Template } from "../generated/templates"
import { ERC20 } from "../generated/LSSVMPairFactory/ERC20"
import { LSSVMPairERC721 } from "../generated/LSSVMPairFactory/LSSVMPairERC721"
import { LSSVMPairERC1155 } from "../generated/LSSVMPairFactory/LSSVMPairERC1155"
import { LSSVMPairERC20 } from "../generated/LSSVMPairFactory/LSSVMPairERC20"

export function handleNewERC721Pair(event: NewERC721Pair): void {
  let pair = new Pair(event.params.poolAddress.toHex())
  let pairContract = LSSVMPairERC721.bind(event.params.poolAddress)

  let ownerAddress = pairContract.owner()
  let pairOwner = PairOwner.load(ownerAddress.toHex())
  if (pairOwner === null) {
    pairOwner = new PairOwner(ownerAddress.toHex())
  }

  let collectionAddress = pairContract.nft()
  let collection = Collection.load(collectionAddress.toHex())
  let isNewCollection = collection === null
  if (collection === null) {
    collection = new Collection(collectionAddress.toHex())
    collection.ethOfferTVL = BigInt.zero()
    collection.ethVolume = BigInt.zero()
  }

  pair.owner = pairOwner.id
  pair.collection = collection.id
  pair.type = BigInt.fromI32(pairContract.poolType())
  pair.variant = BigInt.fromI32(pairContract.pairVariant())
  pair.assetRecipient = pairContract.getAssetRecipient().toHex()
  pair.bondingCurve = pairContract.bondingCurve().toHex()
  pair.propertyChecker = pairContract.propertyChecker().toHex()
  pair.delta = pairContract.delta()
  pair.fee = pairContract.fee()
  pair.spotPrice = pairContract.spotPrice()
  let initialNFTIDs = event.params.initialIds
  initialNFTIDs.sort()
  pair.nftIds = initialNFTIDs
  pair.numNfts = BigInt.fromI32(initialNFTIDs.length)
  pair.tokenBalance = BigInt.zero()
  pair.tokenVolume = BigInt.zero()
  pair.swapNonce = BigInt.zero()
  pair.creationTxHash = event.transaction.hash
  pair.creationEventLogIndex = event.logIndex

  if (pair.variant.equals(BigInt.fromI32(1))) {
    let tokenAddress = LSSVMPairERC20.bind(event.params.poolAddress).token()
    let tokenContract = ERC20.bind(tokenAddress)
    let token = Token.load(tokenAddress.toHex())
    if (token === null) {
      token = new Token(tokenAddress.toHex())
      let nameResult = tokenContract.try_name()
      token.name = nameResult.reverted ? "" : nameResult.value
      let symbolResult = tokenContract.try_symbol()
      token.symbol = symbolResult.reverted ? "" : symbolResult.value
      let decimalsResult = tokenContract.try_decimals()
      token.decimals = decimalsResult.reverted ? BigInt.fromI32(0) : BigInt.fromI32(decimalsResult.value)
      token.save()
    }
    pair.token = token.id
    let balanceResult = tokenContract.try_balanceOf(event.params.poolAddress)
    pair.tokenBalance = balanceResult.reverted ? BigInt.zero() : balanceResult.value
  }

  pair.save()
  pairOwner.save()
  collection.save()

  PairTemplate.create(event.params.poolAddress)
  if (isNewCollection) {
    ERC721Template.create(collectionAddress)
  }
}

export function handleNewERC1155Pair(event: NewERC1155Pair): void {
  let pair = new Pair(event.params.poolAddress.toHex())
  let pairContract = LSSVMPairERC1155.bind(event.params.poolAddress)

  let ownerAddress = pairContract.owner()
  let pairOwner = PairOwner.load(ownerAddress.toHex())
  if (pairOwner === null) {
    pairOwner = new PairOwner(ownerAddress.toHex())
  }

  let collectionAddress = pairContract.nft()
  let collection = Collection.load(collectionAddress.toHex())
  let isNewCollection = collection === null
  if (collection === null) {
    collection = new Collection(collectionAddress.toHex())
    collection.ethOfferTVL = BigInt.zero()
    collection.ethVolume = BigInt.zero()
  }

  pair.owner = pairOwner.id
  pair.collection = collection.id
  pair.type = BigInt.fromI32(pairContract.poolType())
  pair.variant = BigInt.fromI32(pairContract.pairVariant())
  pair.assetRecipient = pairContract.getAssetRecipient().toHex()
  pair.bondingCurve = pairContract.bondingCurve().toHex()
  pair.delta = pairContract.delta()
  pair.fee = pairContract.fee()
  pair.spotPrice = pairContract.spotPrice()
  pair.nftId = pairContract.nftId()
  pair.numNfts = event.params.initialBalance
  pair.tokenBalance = BigInt.zero()
  pair.tokenVolume = BigInt.zero()
  pair.swapNonce = BigInt.zero()
  pair.creationTxHash = event.transaction.hash
  pair.creationEventLogIndex = event.logIndex

  if (pair.variant.equals(BigInt.fromI32(3))) {
    let tokenAddress = LSSVMPairERC20.bind(event.params.poolAddress).token()
    let tokenContract = ERC20.bind(tokenAddress)
    let token = Token.load(tokenAddress.toHex())
    if (token === null) {
      token = new Token(tokenAddress.toHex())
      let nameResult = tokenContract.try_name()
      token.name = nameResult.reverted ? "" : nameResult.value
      let symbolResult = tokenContract.try_symbol()
      token.symbol = symbolResult.reverted ? "" : symbolResult.value
      let decimalsResult = tokenContract.try_decimals()
      token.decimals = decimalsResult.reverted ? BigInt.fromI32(0) : BigInt.fromI32(decimalsResult.value)
      token.save()
    }
    pair.token = token.id
    let balanceResult = tokenContract.try_balanceOf(event.params.poolAddress)
    pair.tokenBalance = balanceResult.reverted ? BigInt.zero() : balanceResult.value
  }

  pair.save()
  pairOwner.save()
  collection.save()

  PairTemplate.create(event.params.poolAddress)
  if (isNewCollection) {
    ERC1155Template.create(collectionAddress)
  }
}