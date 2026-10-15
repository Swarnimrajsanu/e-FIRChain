import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const FIRRegistry = await ethers.getContractFactory('FIRRegistry');
  const firRegistry = await FIRRegistry.deploy();
  await firRegistry.waitForDeployment();

  const address = await firRegistry.getAddress();
  console.log('FIRRegistry deployed to:', address);

  // Update backend .env with contract address
  const backendEnvPath = path.join(__dirname, '../../backend/.env');
  let envContent = fs.readFileSync(backendEnvPath, 'utf8');

  if (envContent.includes('CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${address}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${address}`;
  }

  fs.writeFileSync(backendEnvPath, envContent);
  console.log('Contract address saved to backend/.env');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
