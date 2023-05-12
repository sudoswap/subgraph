import { BigInt } from "@graphprotocol/graph-ts"
import { Pair } from "../generated/schema"
import { Transfer, ConsecutiveTransfer } from "../generated/templates/ERC721/ERC721"

const NEG_ONE_INT = BigInt.fromI32(-1)
const ONE_INT = BigInt.fromI32(1)
const TWO_INT = BigInt.fromI32(2)
const MAX_CONSECUTIVE_TRANSFER_LENGTH = BigInt.fromI32(1000000)

export function handleTransfer(event: Transfer): void {
    let from = event.params.from
    let to = event.params.to
    let tokenId = event.params.tokenId

    let fromPair = Pair.load(from.toHex())
    if (fromPair !== null && fromPair.variant.lt(BigInt.fromI32(2))) {
        // the from address is a pair
        // remove NFT from pair
        let nftIds = fromPair.nftIds!

        // use binary search to find the index of the greatest element
        // < tokenId
        let idx = binarySearchGreatestLessThan(tokenId, nftIds)

        // remove
        if (idx.equals(NEG_ONE_INT)) {
            // tokenId <= all existing elements in nftIds
            nftIds = nftIds.slice(1)
        } else {
            nftIds = nftIds.slice(0, idx.plus(ONE_INT).toI32()).concat(nftIds.slice(idx.plus(TWO_INT).toI32()))
        }

        fromPair.nftIds = nftIds
        fromPair.numNfts = fromPair.numNfts.minus(ONE_INT)
        fromPair.save()
    }

    let toPair = Pair.load(to.toHex())
    if (toPair !== null && toPair.variant.lt(BigInt.fromI32(2))) {
        // the to address is a pair

        // early return if the transfer is part of pair creation (edge case)
        if (event.transaction.hash.equals(toPair.creationTxHash) && event.logIndex.lt(toPair.creationEventLogIndex)) return;

        // add NFT to pair
        let nftIds = toPair.nftIds!

        // use binary search to find the index of the greatest element
        // < tokenId
        let idx = binarySearchGreatestLessThan(tokenId, nftIds)

        // ensure no duplicates
        if (idx.equals(BigInt.fromI32(nftIds.length - 1)) || nftIds[idx.plus(ONE_INT).toI32()].notEqual(tokenId)) {
            // insert
            if (idx.equals(NEG_ONE_INT)) {
                // tokenId <= all existing elements in nftIds
                nftIds = [tokenId].concat(nftIds)
            } else if (idx.equals(BigInt.fromI32(nftIds.length - 1))) {
                // tokenId > all existing elements in nftIds
                nftIds.push(tokenId)
            } else {
                nftIds = nftIds.slice(0, idx.plus(ONE_INT).toI32()).concat([tokenId]).concat(nftIds.slice(idx.plus(ONE_INT).toI32()))
            }

            toPair.nftIds = nftIds
            toPair.numNfts = toPair.numNfts.plus(ONE_INT)
            toPair.save()
        }
    }
}

export function handleConsecutiveTransfer(event: ConsecutiveTransfer): void {
    let fromAddress = event.params.fromAddress
    let toAddress = event.params.toAddress
    let fromTokenId = event.params.fromTokenId
    let toTokenId = event.params.toTokenId
    let numTokenTransfers = toTokenId.minus(fromTokenId).plus(ONE_INT)

    if (toTokenId.lt(fromTokenId) || numTokenTransfers.gt(MAX_CONSECUTIVE_TRANSFER_LENGTH)) {
        // invalid transfer, ignore
        return
    }

    let fromPair = Pair.load(fromAddress.toHex())
    if (fromPair !== null && fromPair.variant.lt(BigInt.fromI32(2))) {
        // the from address is a pair
        // remove NFT from pair
        let nftIds = fromPair.nftIds!

        // use binary search to find the index of the greatest element
        // < fromTokenId
        let idx = binarySearchGreatestLessThan(fromTokenId, nftIds)

        // remove
        if (idx.equals(NEG_ONE_INT)) {
            // fromTokenId <= all existing elements in nftIds
            nftIds = nftIds.slice(numTokenTransfers.toI32())
        } else {
            nftIds = nftIds.slice(0, idx.plus(ONE_INT).toI32()).concat(nftIds.slice(idx.plus(ONE_INT).plus(numTokenTransfers).toI32()))
        }

        fromPair.nftIds = nftIds
        fromPair.numNfts = fromPair.numNfts.minus(numTokenTransfers)
        fromPair.save()
    }

    let toPair = Pair.load(toAddress.toHex())
    if (toPair !== null && toPair.variant.lt(BigInt.fromI32(2))) {
        // the to address is a pair

        // early return if the transfer is part of pair creation (edge case)
        if (event.transaction.hash.equals(toPair.creationTxHash) && event.logIndex.lt(toPair.creationEventLogIndex)) return;

        // add NFT to pair
        let nftIds = toPair.nftIds!
        let consecutiveNftIds = new Array<BigInt>(numTokenTransfers.toI32())
        for (let i = BigInt.zero(); i.lt(numTokenTransfers); i = i.plus(ONE_INT)) {
            consecutiveNftIds[i.toI32()] = i.plus(ONE_INT)
        }

        // use binary search to find the index of the greatest element
        // < fromTokenId
        let idx = binarySearchGreatestLessThan(fromTokenId, nftIds)

        // insert
        if (idx.equals(NEG_ONE_INT)) {
            // fromTokenId <= all existing elements in nftIds
            nftIds = consecutiveNftIds.concat(nftIds)
        } else if (idx.equals(BigInt.fromI32(nftIds.length - 1))) {
            // fromTokenId > all existing elements in nftIds
            nftIds = nftIds.concat(consecutiveNftIds)
        } else {
            nftIds = nftIds.slice(0, idx.plus(ONE_INT).toI32()).concat(consecutiveNftIds).concat(nftIds.slice(idx.plus(ONE_INT).toI32()))
        }

        toPair.nftIds = nftIds
        toPair.numNfts = toPair.numNfts.plus(numTokenTransfers)
        toPair.save()
    }
}

function binarySearchGreatestLessThan(value: BigInt, array: Array<BigInt>): BigInt {
    // use binary search to find the index of the greatest element
    // < value
    let lo = BigInt.zero()
    let hi = BigInt.fromI32(array.length - 1)
    let idx = NEG_ONE_INT
    while (lo.le(hi)) {
        let mid = lo.plus(hi.minus(lo).plus(ONE_INT).div(TWO_INT))
        let midVal = array[mid.toI32()]
        if (midVal.lt(value)) {
            idx = mid
            lo = mid.plus(ONE_INT)
        } else {
            hi = mid.minus(ONE_INT)
        }
    }
    return idx
}