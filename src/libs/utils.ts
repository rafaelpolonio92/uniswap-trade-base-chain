import { BigNumberish, parseUnits } from 'ethers'
import { SwapQuoter } from '@uniswap/v3-sdk'
import { CurrencyAmount, TradeType, Token } from '@uniswap/sdk-core'
import { CurrentConfig } from 'config'
import { QUOTER_CONTRACT_ADDRESS } from '@libs/constants';
import { AbiCoder, ethers } from 'ethers';
import { Route } from "@uniswap/v3-sdk";

export const fromReadableAmount = (
  amount: number,
  decimals: number
): BigNumberish => {
  return parseUnits(amount.toString(), decimals)
}

export const getOutputQuote = async (swapRoute: Route<Token, Token>, provider: ethers.JsonRpcProvider) => {
  const { calldata } = SwapQuoter.quoteCallParameters(
    swapRoute,
    CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      ).toString()
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  )

  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  });
  return new AbiCoder().decode(['uint256'], quoteCallReturnData)
}