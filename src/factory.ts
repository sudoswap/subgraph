import {
  CreatePairERC1155ERC20Call,
  CreatePairERC1155ETHCall,
  CreatePairERC721ERC20Call,
  CreatePairERC721ETHCall
} from "../generated/LSSVMFactory/LSSVMFactory"
import { Pair, Collection, PairOwner, Token } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { LSSVMPair as PairTemplate, ERC721 as ERC721Template, ERC1155 as ERC1155Template } from "../generated/templates"
import { ERC20 } from "../generated/LSSVMFactory/ERC20"

export function handleNewERC721ETHPair(call: CreatePairERC721ETHCall): void {
  let pair = new Pair(call.outputs.pair.toHex())

  let ownerAddress = call.from
  let pairOwner = PairOwner.load(ownerAddress.toHex())
  if (pairOwner === null) {
    pairOwner = new PairOwner(ownerAddress.toHex())
  }

  let collectionAddress = call.inputs._nft
  let collection = Collection.load(collectionAddress.toHex())
  let isNewCollection = collection === null
  if (collection === null) {
    collection = new Collection(collectionAddress.toHex())
    collection.ethOfferTVL = BigInt.zero()
    collection.ethVolume = BigInt.zero()
  }

  pair.owner = pairOwner.id
  pair.collection = collection.id
  pair.type = BigInt.fromI32(call.inputs._poolType)
  pair.variant = BigInt.fromI32(0) // ERC721_ETH
  pair.assetRecipient = call.inputs._assetRecipient.toHex()
  pair.bondingCurve = call.inputs._bondingCurve.toHex()
  pair.delta = call.inputs._delta
  pair.fee = call.inputs._fee
  pair.spotPrice = call.inputs._spotPrice
  let initialNFTIDs = call.inputs._initialNFTIDs
  initialNFTIDs.sort()
  pair.nftIds = initialNFTIDs
  pair.numNfts = BigInt.fromI32(call.inputs._initialNFTIDs.length)
  pair.tokenBalance = BigInt.zero()
  pair.tokenVolume = BigInt.zero()

  pair.swapNonce = BigInt.zero()

  pair.save()
  pairOwner.save()
  collection.save()

  PairTemplate.create(call.outputs.pair)
  if (isNewCollection) {
    ERC721Template.create(collectionAddress)
  }
}

export function handleNewERC721ERC20Pair(call: CreatePairERC721ERC20Call): void {
  let pair = new Pair(call.outputs.pair.toHex())

  let ownerAddress = call.from
  let pairOwner = PairOwner.load(ownerAddress.toHex())
  if (pairOwner === null) {
    pairOwner = new PairOwner(ownerAddress.toHex())
  }

  let collectionAddress = call.inputs.params.nft
  let collection = Collection.load(collectionAddress.toHex())
  let isNewCollection = collection === null
  if (collection === null) {
    collection = new Collection(collectionAddress.toHex())
    collection.ethOfferTVL = BigInt.zero()
    collection.ethVolume = BigInt.zero()
  }

  pair.owner = pairOwner.id
  pair.collection = collection.id
  pair.type = BigInt.fromI32(call.inputs.params.poolType)
  pair.variant = BigInt.fromI32(1) // ERC721_ERC20
  pair.assetRecipient = call.inputs.params.assetRecipient.toHex()
  pair.bondingCurve = call.inputs.params.bondingCurve.toHex()
  pair.delta = call.inputs.params.delta
  pair.fee = call.inputs.params.fee
  pair.spotPrice = call.inputs.params.spotPrice
  let initialNFTIDs = call.inputs.params.initialNFTIDs
  initialNFTIDs.sort()
  pair.nftIds = initialNFTIDs
  pair.numNfts = BigInt.fromI32(call.inputs.params.initialNFTIDs.length)
  pair.tokenBalance = BigInt.zero()
  pair.tokenVolume = BigInt.zero()

  let tokenContract = ERC20.bind(call.inputs.params.token)
  let token = Token.load(call.inputs.params.token.toHex())
  if (token === null) {
    token = new Token(call.inputs.params.token.toHex())
    let nameResult = tokenContract.try_name()
    token.name = nameResult.reverted ? "" : nameResult.value
    let symbolResult = tokenContract.try_symbol()
    token.symbol = symbolResult.reverted ? "" : symbolResult.value
    let decimalsResult = tokenContract.try_decimals()
    token.decimals = decimalsResult.reverted ? BigInt.fromI32(0) : BigInt.fromI32(decimalsResult.value)
    token.save()
  }
  pair.token = token.id
  let balanceResult = tokenContract.try_balanceOf(call.outputs.pair)
  pair.tokenBalance = balanceResult.reverted ? BigInt.zero() : balanceResult.value

  pair.swapNonce = BigInt.zero()

  pair.save()
  pairOwner.save()
  collection.save()

  PairTemplate.create(call.outputs.pair)
  if (isNewCollection) {
    ERC721Template.create(collectionAddress)
  }
}

export function handleNewERC1155ETHPair(call: CreatePairERC1155ETHCall): void {
  let pair = new Pair(call.outputs.pair.toHex())

  let ownerAddress = call.from
  let pairOwner = PairOwner.load(ownerAddress.toHex())
  if (pairOwner === null) {
    pairOwner = new PairOwner(ownerAddress.toHex())
  }

  let collectionAddress = call.inputs._nft
  let collection = Collection.load(collectionAddress.toHex())
  let isNewCollection = collection === null
  if (collection === null) {
    collection = new Collection(collectionAddress.toHex())
    collection.ethOfferTVL = BigInt.zero()
    collection.ethVolume = BigInt.zero()
  }

  pair.owner = pairOwner.id
  pair.collection = collection.id
  pair.type = BigInt.fromI32(call.inputs._poolType)
  pair.variant = BigInt.fromI32(2) // ERC1155_ETH
  pair.assetRecipient = call.inputs._assetRecipient.toHex()
  pair.bondingCurve = call.inputs._bondingCurve.toHex()
  pair.delta = call.inputs._delta
  pair.fee = call.inputs._fee
  pair.spotPrice = call.inputs._spotPrice
  pair.numNfts = call.inputs._initialNFTBalance
  pair.tokenBalance = BigInt.zero()
  pair.tokenVolume = BigInt.zero()

  pair.swapNonce = BigInt.zero()

  pair.save()
  pairOwner.save()
  collection.save()

  PairTemplate.create(call.outputs.pair)
  if (isNewCollection) {
    ERC1155Template.create(collectionAddress)
  }
}

export function handleNewERC1155ERC20Pair(call: CreatePairERC1155ERC20Call): void {
  let pair = new Pair(call.outputs.pair.toHex())

  let ownerAddress = call.from
  let pairOwner = PairOwner.load(ownerAddress.toHex())
  if (pairOwner === null) {
    pairOwner = new PairOwner(ownerAddress.toHex())
  }

  let collectionAddress = call.inputs.params.nft
  let collection = Collection.load(collectionAddress.toHex())
  let isNewCollection = collection === null
  if (collection === null) {
    collection = new Collection(collectionAddress.toHex())
    collection.ethOfferTVL = BigInt.zero()
    collection.ethVolume = BigInt.zero()
  }

  pair.owner = pairOwner.id
  pair.collection = collection.id
  pair.type = BigInt.fromI32(call.inputs.params.poolType)
  pair.variant = BigInt.fromI32(3) // ERC1155_ERC20
  pair.assetRecipient = call.inputs.params.assetRecipient.toHex()
  pair.bondingCurve = call.inputs.params.bondingCurve.toHex()
  pair.delta = call.inputs.params.delta
  pair.fee = call.inputs.params.fee
  pair.spotPrice = call.inputs.params.spotPrice
  pair.numNfts = call.inputs.params.initialNFTBalance
  pair.tokenBalance = BigInt.zero()
  pair.tokenVolume = BigInt.zero()

  let tokenContract = ERC20.bind(call.inputs.params.token)
  let token = Token.load(call.inputs.params.token.toHex())
  if (token === null) {
    token = new Token(call.inputs.params.token.toHex())
    let nameResult = tokenContract.try_name()
    token.name = nameResult.reverted ? "" : nameResult.value
    let symbolResult = tokenContract.try_symbol()
    token.symbol = symbolResult.reverted ? "" : symbolResult.value
    let decimalsResult = tokenContract.try_decimals()
    token.decimals = decimalsResult.reverted ? BigInt.fromI32(0) : BigInt.fromI32(decimalsResult.value)
    token.save()
  }
  pair.token = token.id
  let balanceResult = tokenContract.try_balanceOf(call.outputs.pair)
  pair.tokenBalance = balanceResult.reverted ? BigInt.zero() : balanceResult.value

  pair.swapNonce = BigInt.zero()

  pair.save()
  pairOwner.save()
  collection.save()

  PairTemplate.create(call.outputs.pair)
  if (isNewCollection) {
    ERC1155Template.create(collectionAddress)
  }
}