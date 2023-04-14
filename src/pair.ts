import { AssetRecipientChange, DeltaUpdate, FeeUpdate, OwnershipTransferred, SpotPriceUpdate, SwapNFTInPair, SwapNFTInPair1 as SwapNFTInPairERC1155, SwapNFTOutPair, SwapNFTOutPair1 as SwapNFTOutPairERC1155, TokenDeposit, TokenWithdrawal } from "../generated/templates/LSSVMPair/LSSVMPair"
import { Collection, Pair, PairOwner, Swap } from "../generated/schema"
import { Address, BigInt } from "@graphprotocol/graph-ts"

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    let pair = Pair.load(event.address.toHex())!

    let pairOwner = PairOwner.load(event.params.newOwner.toHex())
    if (pairOwner === null) {
        pairOwner = new PairOwner(event.params.newOwner.toHex())
    }

    pair.owner = pairOwner.id

    pair.save()
    pairOwner.save()
}

export function handleAssetRecipientChange(event: AssetRecipientChange): void {
    let pair = Pair.load(event.address.toHex())!
    if (event.params.a.equals(Address.zero())) {
        // recipient is pair
        pair.assetRecipient = event.address.toHex()
    } else {
        // set new recipient
        pair.assetRecipient = event.params.a.toHex()
    }
    pair.save()
}

export function handleDeltaUpdate(event: DeltaUpdate): void {
    let pair = Pair.load(event.address.toHex())!
    pair.delta = event.params.newDelta
    pair.save()
}

export function handleFeeUpdate(event: FeeUpdate): void {
    let pair = Pair.load(event.address.toHex())!
    pair.fee = event.params.newFee
    pair.save()
}

export function handleSpotPriceUpdate(event: SpotPriceUpdate): void {
    let pair = Pair.load(event.address.toHex())!
    pair.spotPrice = event.params.newSpotPrice
    pair.save()
}

export function handleTokenDeposit(event: TokenDeposit): void {
    let pair = Pair.load(event.address.toHex())!
    if (pair.token === null) {
        // ETH pair
        pair.tokenBalance = pair.tokenBalance.plus(event.params.amount)
        pair.save()

        if (shouldCountPairOfferTVL(pair)) {
            let collection = Collection.load(pair.collection)
            collection!.ethOfferTVL = collection!.ethOfferTVL.plus(event.params.amount)
            collection!.save()
        }
    } else {
        // ERC20 pair
        pair.tokenBalance = pair.tokenBalance.plus(event.params.amount)
        pair.save()
    }
}

export function handleTokenWithdrawal(event: TokenWithdrawal): void {
    let pair = Pair.load(event.address.toHex())!
    if (pair.token === null) {
        // ETH pair
        pair.tokenBalance = pair.tokenBalance.minus(event.params.amount)
        pair.save()

        if (shouldCountPairOfferTVL(pair)) {
            let collection = Collection.load(pair.collection)
            collection!.ethOfferTVL = collection!.ethOfferTVL.minus(event.params.amount)
            collection!.save()
        }
    } else {
        // ERC20 pair
        pair.tokenBalance = pair.tokenBalance.minus(event.params.amount)
        pair.save()
    }
}

export function handleSwapNFTInPair_erc721(event: SwapNFTInPair): void {
    // ERC721 -> Token swap
    let pair = Pair.load(event.address.toHex())!
    let tokenAmount = event.params.amountOut

    let swap = new Swap(pair.id + "-" + pair.swapNonce.toString())
    swap.pair = pair.id
    swap.swapNonce = pair.swapNonce
    swap.timestamp = event.block.timestamp
    swap.transactionHash = event.transaction.hash.toHex()
    swap.isTokenToNFT = false
    swap.tokenAmount = tokenAmount
    swap.nftIds = event.params.ids
    swap.save()

    pair.swapNonce = pair.swapNonce.plus(BigInt.fromI32(1))

    if (pair.token === null) {
        // ETH pair
        if (pair.assetRecipient === event.address.toHex()) {
            pair.tokenBalance = pair.tokenBalance.minus(tokenAmount)
        }
        pair.tokenVolume = pair.tokenVolume.plus(tokenAmount)
        pair.save()

        let collection = Collection.load(pair.collection)
        collection!.ethVolume = collection!.ethVolume.plus(tokenAmount)
        collection!.save()
    } else {
        // ERC20 pair
        if (pair.assetRecipient === event.address.toHex()) {
            pair.tokenBalance = pair.tokenBalance.minus(tokenAmount)
        }
        pair.tokenVolume = pair.tokenVolume.plus(tokenAmount)
        pair.save()
    }
}

export function handleSwapNFTOutPair_erc721(event: SwapNFTOutPair): void {
    // Token -> ERC721 swap
    let pair = Pair.load(event.address.toHex())!
    let tokenAmount = event.params.amountIn

    let swap = new Swap(pair.id + "-" + pair.swapNonce.toString())
    swap.pair = pair.id
    swap.swapNonce = pair.swapNonce
    swap.timestamp = event.block.timestamp
    swap.transactionHash = event.transaction.hash.toHex()
    swap.isTokenToNFT = true
    swap.tokenAmount = tokenAmount
    swap.nftIds = event.params.ids
    swap.save()

    pair.swapNonce = pair.swapNonce.plus(BigInt.fromI32(1))

    if (pair.token === null) {
        // ETH pair
        if (pair.assetRecipient === event.address.toHex()) {
            pair.tokenBalance = pair.tokenBalance.plus(tokenAmount)
        }
        pair.tokenVolume = pair.tokenVolume.plus(tokenAmount)
        pair.save()

        let collection = Collection.load(pair.collection)
        collection!.ethVolume = collection!.ethVolume.plus(tokenAmount)
        collection!.save()
    } else {
        // ERC20 pair
        if (pair.assetRecipient === event.address.toHex()) {
            pair.tokenBalance = pair.tokenBalance.plus(tokenAmount)
        }
        pair.tokenVolume = pair.tokenVolume.plus(tokenAmount)
        pair.save()
    }
}

export function handleSwapNFTInPair_erc1155(event: SwapNFTInPairERC1155): void {
    // ERC1155 -> Token swap
    let pair = Pair.load(event.address.toHex())!
    let tokenAmount = event.params.amountOut

    let swap = new Swap(pair.id + "-" + pair.swapNonce.toString())
    swap.pair = pair.id
    swap.swapNonce = pair.swapNonce
    swap.timestamp = event.block.timestamp
    swap.transactionHash = event.transaction.hash.toHex()
    swap.isTokenToNFT = false
    swap.tokenAmount = tokenAmount
    let nftIds = new Array<BigInt>(1)
    nftIds[0] = event.params.numNFTs
    swap.nftIds = nftIds
    swap.save()

    pair.swapNonce = pair.swapNonce.plus(BigInt.fromI32(1))

    if (pair.token === null) {
        // ETH pair
        if (pair.assetRecipient === event.address.toHex()) {
            pair.tokenBalance = pair.tokenBalance.minus(tokenAmount)
        }
        pair.tokenVolume = pair.tokenVolume.plus(tokenAmount)
        pair.save()

        let collection = Collection.load(pair.collection)
        collection!.ethVolume = collection!.ethVolume.plus(tokenAmount)
        collection!.save()
    } else {
        // ERC20 pair
        if (pair.assetRecipient === event.address.toHex()) {
            pair.tokenBalance = pair.tokenBalance.minus(tokenAmount)
        }
        pair.tokenVolume = pair.tokenVolume.plus(tokenAmount)
        pair.save()
    }
}

export function handleSwapNFTOutPair_erc1155(event: SwapNFTOutPairERC1155): void {
    // Token -> ERC1155 swap
    let pair = Pair.load(event.address.toHex())!
    let tokenAmount = event.params.amountIn

    let swap = new Swap(pair.id + "-" + pair.swapNonce.toString())
    swap.pair = pair.id
    swap.swapNonce = pair.swapNonce
    swap.timestamp = event.block.timestamp
    swap.transactionHash = event.transaction.hash.toHex()
    swap.isTokenToNFT = true
    swap.tokenAmount = event.params.amountIn
    let nftIds = new Array<BigInt>(1)
    nftIds[0] = event.params.numNFTs
    swap.nftIds = nftIds
    swap.save()

    pair.swapNonce = pair.swapNonce.plus(BigInt.fromI32(1))

    if (pair.token === null) {
        // ETH pair
        if (pair.assetRecipient === event.address.toHex()) {
            pair.tokenBalance = pair.tokenBalance.plus(tokenAmount)
        }
        pair.tokenVolume = pair.tokenVolume.plus(tokenAmount)
        pair.save()

        let collection = Collection.load(pair.collection)
        collection!.ethVolume = collection!.ethVolume.plus(tokenAmount)
        collection!.save()
    } else {
        // ERC20 pair
        if (pair.assetRecipient === event.address.toHex()) {
            pair.tokenBalance = pair.tokenBalance.plus(tokenAmount)
        }
        pair.tokenVolume = pair.tokenVolume.plus(tokenAmount)
        pair.save()
    }
}

function shouldCountPairOfferTVL(pair: Pair): bool {
    // is TOKEN or TRADE pair
    return pair.type.equals(BigInt.zero()) || pair.type.equals(BigInt.fromI32(2))
}