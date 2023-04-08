import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  BondingCurveStatusUpdate,
  CallTargetStatusUpdate,
  NFTDeposit,
  NewPair,
  OwnershipTransferred,
  ProtocolFeeMultiplierUpdate,
  ProtocolFeeRecipientUpdate,
  RouterStatusUpdate,
  TokenDeposit
} from "../generated/LSSVMPairFactory/LSSVMPairFactory"

export function createBondingCurveStatusUpdateEvent(
  bondingCurve: Address,
  isAllowed: boolean
): BondingCurveStatusUpdate {
  let bondingCurveStatusUpdateEvent = changetype<BondingCurveStatusUpdate>(
    newMockEvent()
  )

  bondingCurveStatusUpdateEvent.parameters = new Array()

  bondingCurveStatusUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "bondingCurve",
      ethereum.Value.fromAddress(bondingCurve)
    )
  )
  bondingCurveStatusUpdateEvent.parameters.push(
    new ethereum.EventParam("isAllowed", ethereum.Value.fromBoolean(isAllowed))
  )

  return bondingCurveStatusUpdateEvent
}

export function createCallTargetStatusUpdateEvent(
  target: Address,
  isAllowed: boolean
): CallTargetStatusUpdate {
  let callTargetStatusUpdateEvent = changetype<CallTargetStatusUpdate>(
    newMockEvent()
  )

  callTargetStatusUpdateEvent.parameters = new Array()

  callTargetStatusUpdateEvent.parameters.push(
    new ethereum.EventParam("target", ethereum.Value.fromAddress(target))
  )
  callTargetStatusUpdateEvent.parameters.push(
    new ethereum.EventParam("isAllowed", ethereum.Value.fromBoolean(isAllowed))
  )

  return callTargetStatusUpdateEvent
}

export function createNFTDepositEvent(poolAddress: Address): NFTDeposit {
  let nftDepositEvent = changetype<NFTDeposit>(newMockEvent())

  nftDepositEvent.parameters = new Array()

  nftDepositEvent.parameters.push(
    new ethereum.EventParam(
      "poolAddress",
      ethereum.Value.fromAddress(poolAddress)
    )
  )

  return nftDepositEvent
}

export function createNewPairEvent(poolAddress: Address): NewPair {
  let newPairEvent = changetype<NewPair>(newMockEvent())

  newPairEvent.parameters = new Array()

  newPairEvent.parameters.push(
    new ethereum.EventParam(
      "poolAddress",
      ethereum.Value.fromAddress(poolAddress)
    )
  )

  return newPairEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createProtocolFeeMultiplierUpdateEvent(
  newMultiplier: BigInt
): ProtocolFeeMultiplierUpdate {
  let protocolFeeMultiplierUpdateEvent = changetype<
    ProtocolFeeMultiplierUpdate
  >(newMockEvent())

  protocolFeeMultiplierUpdateEvent.parameters = new Array()

  protocolFeeMultiplierUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "newMultiplier",
      ethereum.Value.fromUnsignedBigInt(newMultiplier)
    )
  )

  return protocolFeeMultiplierUpdateEvent
}

export function createProtocolFeeRecipientUpdateEvent(
  recipientAddress: Address
): ProtocolFeeRecipientUpdate {
  let protocolFeeRecipientUpdateEvent = changetype<ProtocolFeeRecipientUpdate>(
    newMockEvent()
  )

  protocolFeeRecipientUpdateEvent.parameters = new Array()

  protocolFeeRecipientUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "recipientAddress",
      ethereum.Value.fromAddress(recipientAddress)
    )
  )

  return protocolFeeRecipientUpdateEvent
}

export function createRouterStatusUpdateEvent(
  router: Address,
  isAllowed: boolean
): RouterStatusUpdate {
  let routerStatusUpdateEvent = changetype<RouterStatusUpdate>(newMockEvent())

  routerStatusUpdateEvent.parameters = new Array()

  routerStatusUpdateEvent.parameters.push(
    new ethereum.EventParam("router", ethereum.Value.fromAddress(router))
  )
  routerStatusUpdateEvent.parameters.push(
    new ethereum.EventParam("isAllowed", ethereum.Value.fromBoolean(isAllowed))
  )

  return routerStatusUpdateEvent
}

export function createTokenDepositEvent(poolAddress: Address): TokenDeposit {
  let tokenDepositEvent = changetype<TokenDeposit>(newMockEvent())

  tokenDepositEvent.parameters = new Array()

  tokenDepositEvent.parameters.push(
    new ethereum.EventParam(
      "poolAddress",
      ethereum.Value.fromAddress(poolAddress)
    )
  )

  return tokenDepositEvent
}
