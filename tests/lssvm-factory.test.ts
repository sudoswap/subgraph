import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { ExampleEntity } from "../generated/schema"
import { BondingCurveStatusUpdate } from "../generated/LSSVMPairFactory/LSSVMPairFactory"
import { handleBondingCurveStatusUpdate } from "../src/lssvm-factory"
import { createBondingCurveStatusUpdateEvent } from "./lssvm-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let bondingCurve = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let isAllowed = "boolean Not implemented"
    let newBondingCurveStatusUpdateEvent = createBondingCurveStatusUpdateEvent(
      bondingCurve,
      isAllowed
    )
    handleBondingCurveStatusUpdate(newBondingCurveStatusUpdateEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExampleEntity created and stored", () => {
    assert.entityCount("ExampleEntity", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "bondingCurve",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "isAllowed",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
