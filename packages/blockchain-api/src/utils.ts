/* tslint:disable:no-console */
import { CeloContract, ContractKit, newKitFromWeb3 } from '@celo/contractkit'
import * as utf8 from 'utf8'
import Web3 from 'web3'
import coder from 'web3-eth-abi'
import { WEB3_PROVIDER_URL } from './config'

export function randomTimestamp() {
  const start = new Date(2018, 0, 1)
  const end = new Date()
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

export function randomAddr() {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = '0x'
  let randomPoz
  for (let i = 0; i < 40; i++) {
    randomPoz = Math.floor(Math.random() * charSet.length)
    randomString += charSet.substring(randomPoz, randomPoz + 1)
  }
  return randomString
}

export function formatCommentString(functionCallHex: string): string {
  // '0xe1d6aceb' is the function selector for the transfer with comment function
  if (functionCallHex.length < 10 || functionCallHex.slice(0, 10) !== '0xe1d6aceb') {
    return ''
  }
  let comment
  try {
    const data = '0x' + functionCallHex.slice(10)
    comment = coder.decodeParameters(['address', 'uint256', 'string'], data)[2]
    return utf8.decode(comment)
  } catch (e) {
    // TODO: add logging to blockchain-api
    console.log(`Error decoding comment ${functionCallHex}: ${e.message}`)
    return ''
  }
}

// Returns date string in YYYY-MM-DD
export function formatDateString(date: Date) {
  return date.toISOString().split('T')[0]
}

let goldTokenAddress: string
let stableTokenAddress: string
let attestationsAddress: string
let tokenAddressMapping: { [key: string]: string }
export async function getContractAddresses() {
  if (goldTokenAddress && stableTokenAddress && attestationsAddress) {
    console.info('Already got token addresses')
    return { tokenAddressMapping, attestationsAddress }
  } else {
    try {
      const kit = await getContractKit()
      goldTokenAddress = await kit.registry.addressFor(CeloContract.StableToken)
      stableTokenAddress = await kit.registry.addressFor(CeloContract.GoldToken)
      attestationsAddress = await kit.registry.addressFor(CeloContract.Attestations)
      tokenAddressMapping = {
        [goldTokenAddress]: 'Celo Gold',
        [stableTokenAddress]: 'Celo Dollar',
      }
      console.info('Got token addresses' + attestationsAddress)
      return { tokenAddressMapping, attestationsAddress }
    } catch (e) {
      console.info('@getContractAddresses() error', e)
      throw new Error('Unable to fetch contract addresses')
    }
  }
}

let contractKit: ContractKit
export async function getContractKit(): Promise<ContractKit> {
  if (contractKit && (await contractKit.isListening())) {
    // Already connected
    return contractKit
  } else {
    if (WEB3_PROVIDER_URL) {
      const httpProvider = new Web3.providers.HttpProvider(WEB3_PROVIDER_URL)
      const web3 = new Web3(httpProvider)
      contractKit = newKitFromWeb3(web3)
      return contractKit
    } else {
      throw new Error('Missing web3 provider URL, will not be able to fetch contract addresses.')
    }
  }
}
