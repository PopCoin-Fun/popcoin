// import {HardhatRuntimeEnvironment} from 'hardhat/types';
// import {DeployFunction} from 'hardhat-deploy/types';
// // import {parseEther} from 'ethers';
// import { getChainId } from 'hardhat';


// export const ROUTER_ADDRESSES: {
//     [chainId: number] : string[]
// } = {
//     31337: ['0x'],
// 	2522: [//fraxtal testnet
// 		'0xAAA45c8F5ef92a000a121d102F4e89278a711Faa', // Ra
// 		'0x39cd4db6460d8B5961F73E997E86DdbB7Ca4D5F6', //FraxSwap
// 	],
// 	252: [//fraxtal
// 		'0xAAA45c8F5ef92a000a121d102F4e89278a711Faa', // Ra
// 		'0x39cd4db6460d8B5961F73E997E86DdbB7Ca4D5F6', //FraxSwap
// 	],

// 	2713017997578000:[// dchain testnet

// 	]

// }

// const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	
// 	const {ethers, deployments, getNamedAccounts} = hre;
// 	const {deploy} = deployments;

// 	const {deployer, simpleERC20Beneficiary: buyer} = await getNamedAccounts();
// 	const chainId = await getChainId();

// 	let routerAddresses: string[] = ROUTER_ADDRESSES[+chainId];

// 	if(chainId == '31337'){
// 		const routerContract = await ethers.getContract('PancakeRouter');
// 		routerAddresses=[];
// 		routerAddresses.push(routerContract.address);
// 	}else if(chainId == '2522' || chainId == '2713017997578000'){// add zswap router
// 		const routerContract = await ethers.getContract('PancakeRouter');
// 		routerAddresses.push(routerContract.address);

		
// 	}
	
// 	//complete the 4
// 	const remaining = 4-routerAddresses.length
// 	for (let i = 0; i < remaining; i++) {
// 		routerAddresses.push(ethers.constants.AddressZero);		
// 	}

	
// 	await deploy('PopCoinFactory', {
// 		from: deployer,
// 		args: [
// 			routerAddresses
// 		],
// 		log: true,
// 		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
// 	});
	
	
// };
// export default func;
// func.tags = ['PopCoinV1'];
// func.dependencies = [];
