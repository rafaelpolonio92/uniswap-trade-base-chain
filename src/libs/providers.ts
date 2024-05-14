import { ethers, Provider, TransactionRequest, BigNumberish } from 'ethers';
import { computePoolAddress } from '@uniswap/v3-sdk'
import { 
  Token,
} from "@uniswap/sdk-core";
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import * as dotenv from 'dotenv';
import { CurrentConfig, Environment } from 'config';
import { 
  POOL_FACTORY_CONTRACT_ADDRESS, 
  ERC20_ABI, 
  SWAP_ROUTER_ADDRESS,
  TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
} from '@libs/constants';
import { fromReadableAmount } from './utils';

dotenv.config();

interface PoolInfo {
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  sqrtPriceX96: ethers.BigNumberish
  liquidity: ethers.BigNumberish
  tick: number
}

export enum TransactionState {
  Failed = 'Failed',
  New = 'New',
  Rejected = 'Rejected',
  Sending = 'Sending',
  Sent = 'Sent',
}

export const mainnetProvider = new ethers.JsonRpcProvider(
  CurrentConfig.rpc.mainnet
)

const createWallet = (): ethers.Wallet => {
  let provider = mainnetProvider
  if (CurrentConfig.env == Environment.LOCAL) {
    provider = new ethers.JsonRpcProvider(CurrentConfig.rpc.local)
  }
  return new ethers.Wallet(CurrentConfig.wallet.privateKey, provider)
}

export const wallet = createWallet()

export const getProvider = (): Provider | null => {
  return wallet.provider
}

export async function getPoolInfo(): Promise<PoolInfo> {
  const provider = getProvider()
  if (!provider) {
    throw new Error('No provider')
  }

  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  })

  const poolContract = new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    provider
  )

  const [token0, token1, fee, tickSpacing, liquidity, slot0] =
    await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ])

  return {
    token0,
    token1,
    fee,
    tickSpacing,
    liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}

export function getWalletAddress(): string | null {
  return wallet.address
}

async function sendTransactionViaWallet(
  transaction: TransactionRequest
): Promise<TransactionState> {
  const txRes = await wallet.sendTransaction(transaction)

  let receipt = null
  const provider = getProvider()
  if (!provider) {
    return TransactionState.Failed
  }

  while (receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash)

      if (receipt === null) {
        continue
      }
    } catch (e) {
      console.log(`Receipt error:`, e)
      break
    }
  }

  // Transaction was successful if status === 1
  if (receipt) {
    return TransactionState.Sent
  } else {
    return TransactionState.Failed
  }
}

export async function sendTransaction(
  transaction: TransactionRequest
): Promise<TransactionState> {
  return sendTransactionViaWallet(transaction)
}

export async function getTokenTransferApproval(
  token: Token
): Promise<TransactionState> {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!provider || !address) {
    console.log('No Provider Found')
    return TransactionState.Failed
  }

  try {
    const tokenContract = new ethers.Contract(
      token.address,
      ERC20_ABI,
      provider
    )

    const transaction = await tokenContract.populateTransaction.send(
      SWAP_ROUTER_ADDRESS,
      fromReadableAmount(
        TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER,
        token.decimals
      ).toString()
    )

    return sendTransaction({
      ...transaction,
      from: address,
    })
  } catch (e) {
    console.error(e)
    return TransactionState.Failed
  }
}
