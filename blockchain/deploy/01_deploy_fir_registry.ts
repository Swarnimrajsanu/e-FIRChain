import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log(`Deploying to network: ${network.name}`);
  console.log(`Deployer account: ${deployer}`);

  const contract = await deploy('FIRRegistry', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log(`FIRRegistry deployed to: ${contract.address}`);

  // Save contract address to environment
  const fs = require('fs');
  const envContent = `CONTRACT_ADDRESS=${contract.address}\n`;
  fs.appendFileSync('.env', envContent);

  console.log(`Contract address saved to .env file`);
};

export default func;
func.tags = ['FIRRegistry'];