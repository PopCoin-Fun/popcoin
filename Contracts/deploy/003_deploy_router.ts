import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { getChainId } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer, tokenOwner} = await getNamedAccounts();

  const chainId = await getChainId();

  if(chainId == '31337' || chainId == '2522' || chainId == '2713017997578000' || chainId=='2810' || chainId=='12227332'){
    const factory = await deploy('PancakeFactory', {
      from: deployer,
      args: [deployer],
      log: true,
    });
  
    const weth = await deploy('WBNB', {
      from: deployer,
      args: [],
      log: true,
    });
  
    const router = await deploy('PancakeRouter', {
      from: deployer,
      args: [factory.address, weth.address],
      log: true,
    });
  }

  
};
export default func;
func.tags = ['router']; // This sets up a tag so you can execute the script on its own (and its dependencies).