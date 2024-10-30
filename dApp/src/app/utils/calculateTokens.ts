import { readContract } from "@wagmi/core";
import { wagmiConfig } from "../services/web3.service";
import { contractList } from "../models/contract-list";
import { formatEther, parseEther } from "viem";

const PopCoinFactoryABI = require( "../../assets/abis/pop-coin-factory.json");

export const calcInitialTokens = (
    chainId:number,
    blockchainInfo?: {
        initialVirtualEthReserve?:number,
        initialVirtualTokenReserve?:number
    }, 
    ethSupply?: number
)=>{
    if(!ethSupply || ethSupply==0 || !blockchainInfo) return 0;

    // readContract(wagmiConfig,{
    //     address: contractList[chainId!].contract as any,
    //     abi: PopCoinFactoryABI,
    //     functionName: 'calcAmountOutFromEth',
    //     args: [],
        

    // })

    const transactionFeePercent = 0.01
    let fee = ethSupply * transactionFeePercent;
    ethSupply -= fee;

    const ethAmount = parseEther(ethSupply.toString());

    const initialVirtualEthReserve= parseEther( (blockchainInfo.initialVirtualEthReserve??1).toString());
    
    const initialVirtualTokenReserve=parseEther((blockchainInfo.initialVirtualTokenReserve??1073000000).toString());
    const CURVE_CONSTANT = initialVirtualEthReserve * initialVirtualTokenReserve;

    const newVirtualEthReserve = initialVirtualEthReserve + ethAmount;
    const newVirtualTokenReserve = CURVE_CONSTANT / newVirtualEthReserve;
    let amountOut = initialVirtualTokenReserve - newVirtualTokenReserve;

    
    if (amountOut > initialVirtualTokenReserve) {
        amountOut = initialVirtualTokenReserve;
    }
    return +formatEther( amountOut);
    
}
