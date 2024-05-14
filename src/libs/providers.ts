import { ethers, Provider } from 'ethers';
import { computePoolAddress } from '@uniswap/v3-sdk'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import * as dotenv from 'dotenv';
import { CurrentConfig, Environment } from 'config';
import { POOL_FACTORY_CONTRACT_ADDRESS } from '@libs/constants';

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

const { PRIVATE_KEY, RPC_URL } = process.env;

if (!PRIVATE_KEY || !RPC_URL) {
  throw new Error('Please set your PRIVATE_KEY and RPC_URL in a .env file');
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

const getProvider = (): Provider | null => {
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
