import { BigInt } from "@graphprotocol/graph-ts"
import { Pair } from "../generated/schema"
import { TransferBatch, TransferSingle } from "../generated/templates/ERC1155/ERC1155"

export function handleTransferSingle(event: TransferSingle): void {
    let from = event.params.from
    let to = event.params.to
    let tokenId = event.params.id
    let value = event.params.value

    let fromPair = Pair.load(from.toHex())
    if (fromPair !== null && fromPair.variant.ge(BigInt.fromI32(2)) && fromPair.nftId !== null && fromPair.nftId!.equals(tokenId)) {
        fromPair.numNfts = fromPair.numNfts.minus(value)
        fromPair.save()
    }

    let toPair = Pair.load(to.toHex())
    if (toPair !== null && toPair.variant.ge(BigInt.fromI32(2)) && toPair.nftId !== null && toPair.nftId!.equals(tokenId)) {
        // early return if the transfer is part of pair creation (edge case)
        if (event.transaction.hash.equals(toPair.creationTxHash) && event.logIndex.lt(toPair.creationEventLogIndex)) return;

        toPair.numNfts = toPair.numNfts.plus(value)
        toPair.save()
    }
}

export function handleTransferBatch(event: TransferBatch): void {
    let from = event.params.from
    let to = event.params.to
    let tokenIdList = event.params.ids
    let valueList = event.params.values

    if (tokenIdList.length !== valueList.length) {
        // invalid event
        return
    }

    let fromPair = Pair.load(from.toHex())
    if (fromPair !== null && fromPair.variant.ge(BigInt.fromI32(2)) && fromPair.nftId !== null) {
        for (let i = 0; i < tokenIdList.length; i++) {
            let tokenId = tokenIdList[i];
            if (tokenId.equals(fromPair.nftId!)) {
                let value = valueList[i];
                fromPair.numNfts = fromPair.numNfts.minus(value)
            }
        }
        fromPair.save()
    }

    let toPair = Pair.load(to.toHex())
    if (toPair !== null && toPair.variant.ge(BigInt.fromI32(2)) && toPair.nftId !== null) {
        // early return if the transfer is part of pair creation (edge case)
        if (event.transaction.hash.equals(toPair.creationTxHash) && event.logIndex.lt(toPair.creationEventLogIndex)) return;

        for (let i = 0; i < tokenIdList.length; i++) {
            let tokenId = tokenIdList[i];
            if (tokenId.equals(toPair.nftId!)) {
                let value = valueList[i];
                toPair.numNfts = toPair.numNfts.plus(value)
            }
        }
        toPair.save()
    }
}