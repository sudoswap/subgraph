import { AssetRecipientChange, DeltaUpdate, FeeUpdate, OwnershipTransferred, SpotPriceUpdate, SwapNFTInPair, SwapNFTOutPair, SwapNFTsForTokenCall, SwapTokenForSpecificNFTsCall, TokenDeposit, TokenWithdrawal } from "../generated/templates/LSSVMPair/LSSVMPair"
import { Collection, Pair, PairOwner, Swap } from "../generated/schema"
import { Multicall3 } from "../generated/templates/LSSVMPair/Multicall3"
import { ERC20 } from "../generated/templates/LSSVMPair/ERC20"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    let pair = Pair.load(event.address.toHex())

    let pairOwner = PairOwner.load(event.params.newOwner.toHex())
    if (pairOwner === null) {
        pairOwner = new PairOwner(event.params.newOwner.toHex())
    }

    pair!.owner = pairOwner.id

    pair!.save()
    pairOwner.save()
}

export function handleAssetRecipientChange(event: AssetRecipientChange): void {
    let pair = Pair.load(event.address.toHex())
    pair!.assetRecipient = event.params.a.toHex()
    pair!.save()
}

export function handleDeltaUpdate(event: DeltaUpdate): void {
    let pair = Pair.load(event.address.toHex())
    pair!.delta = event.params.newDelta
    pair!.save()
}

export function handleFeeUpdate(event: FeeUpdate): void {
    let pair = Pair.load(event.address.toHex())
    pair!.fee = event.params.newFee
    pair!.save()
}

export function handleSpotPriceUpdate(event: SpotPriceUpdate): void {
    let pair = Pair.load(event.address.toHex())
    pair!.spotPrice = event.params.newSpotPrice
    pair!.save()
}

export function handleTokenDeposit(event: TokenDeposit): void {
    let pair = Pair.load(event.address.toHex())
    if (pair!.token === null) {
        // ETH pair
        handleEthBalanceUpdate(event)
    } else {
        // ERC20 pair
        pair!.tokenBalance = pair!.tokenBalance!.plus(event.params.amount)
        pair!.save()
    }
}

export function handleTokenWithdrawal(event: TokenWithdrawal): void {
    let pair = Pair.load(event.address.toHex())
    if (pair!.token === null) {
        // ETH pair
        handleEthBalanceUpdate(event)
    } else {
        // ERC20 pair
        pair!.tokenBalance = pair!.tokenBalance!.minus(event.params.amount)
        pair!.save()
    }
}

export function handleSwapNFTInPair(event: SwapNFTInPair): void {
    let pair = Pair.load(event.address.toHex())
    if (pair!.token === null) {
        // ETH pair
        let ethChange = handleEthBalanceUpdate(event)
        // Note: we must load pair and collection after the handleEthBalanceUpdate call
        // since we make changes to those entities in the call

        pair = Pair.load(event.address.toHex())
        pair!.ethVolume = pair!.ethVolume.plus(ethChange.abs())
        pair!.save()

        let collection = Collection.load(pair!.collection)
        collection!.ethVolume = collection!.ethVolume.plus(ethChange.abs())
        collection!.save()
    } else {
        // ERC20 pair
        let tokenContract = ERC20.bind(Address.fromString(pair!.token!))
        let tokenBalanceResult = tokenContract.try_balanceOf(event.address)
        let tokenChange = tokenBalanceResult.reverted ? BigInt.zero() : tokenBalanceResult.value.minus(pair!.tokenBalance!)
        pair!.tokenBalance = pair!.tokenBalance!.plus(tokenChange)
        pair!.tokenVolume = pair!.tokenVolume!.plus(tokenChange.abs())
        pair!.save()
    }
}

export function handleSwapNFTOutPair(event: SwapNFTOutPair): void {
    let pair = Pair.load(event.address.toHex())
    if (pair!.token === null) {
        // ETH pair
        let ethChange = handleEthBalanceUpdate(event)
        // Note: we must load pair and collection after the handleEthBalanceUpdate call
        // since we make changes to those entities in the call

        pair = Pair.load(event.address.toHex())
        pair!.ethVolume = pair!.ethVolume.plus(ethChange.abs())
        pair!.save()

        let collection = Collection.load(pair!.collection)
        collection!.ethVolume = collection!.ethVolume.plus(ethChange.abs())
        collection!.save()
    } else {
        // ERC20 pair
        let tokenContract = ERC20.bind(Address.fromString(pair!.token!))
        let tokenBalanceResult = tokenContract.try_balanceOf(event.address)
        let tokenChange = tokenBalanceResult.reverted ? BigInt.zero() : tokenBalanceResult.value.minus(pair!.tokenBalance!)
        pair!.tokenBalance = pair!.tokenBalance!.plus(tokenChange)
        pair!.tokenVolume = pair!.tokenVolume!.plus(tokenChange.abs())
        pair!.save()
    }
}

export function handleSwapTokenForSpecificNFTs(call: SwapTokenForSpecificNFTsCall): void {
    let pair = Pair.load(call.to.toHex())!

    let swap = new Swap(pair.id + "-" + pair.swapNonce.toString())
    swap.pair = pair.id
    swap.swapNonce = pair.swapNonce
    swap.timestamp = call.block.timestamp
    swap.transactionHash = call.transaction.hash.toHex()
    swap.isTokenToNFT = true
    swap.tokenAmount = call.outputs.inputAmount
    swap.nftIds = call.inputs.nftIds
    swap.save()

    pair.swapNonce = pair.swapNonce.plus(BigInt.fromI32(1))
    pair.save()
}

export function handleSwapNFTsForToken(call: SwapNFTsForTokenCall): void {
    let pair = Pair.load(call.to.toHex())!

    let swap = new Swap(pair.id + "-" + pair.swapNonce.toString())
    swap.pair = pair.id
    swap.swapNonce = pair.swapNonce
    swap.timestamp = call.block.timestamp
    swap.transactionHash = call.transaction.hash.toHex()
    swap.isTokenToNFT = false
    swap.tokenAmount = call.outputs.outputAmount
    swap.nftIds = call.inputs.nftIds
    swap.save()

    pair.swapNonce = pair.swapNonce.plus(BigInt.fromI32(1))
    pair.save()
}

function handleEthBalanceUpdate(event: ethereum.Event): BigInt {
    let multicall3 = Multicall3.bind(Address.fromString("0xcA11bde05977b3631167028862bE2a173976CA11"))
    let pair = Pair.load(event.address.toHex())
    let ethChange = multicall3.getEthBalance(event.address).minus(pair!.ethBalance) // positive when ETH goes into the pair, negative when ETH goes out of the pair
    pair!.ethBalance = pair!.ethBalance.plus(ethChange)
    pair!.save()

    if (shouldCountPairOfferTVL(pair!)) {
        let collection = Collection.load(pair!.collection)
        collection!.ethOfferTVL = collection!.ethOfferTVL.plus(ethChange)
        collection!.save()
    }

    return ethChange
}

function shouldCountPairOfferTVL(pair: Pair): bool {
    // is TOKEN or TRADE pair
    return pair.type.equals(BigInt.zero()) || pair.type.equals(BigInt.fromI32(2))
}