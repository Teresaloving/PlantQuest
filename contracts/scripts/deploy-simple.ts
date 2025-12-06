import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const PlantQuest = await ethers.getContractFactory("PlantQuest");
  const plantQuest = await PlantQuest.deploy();

  await plantQuest.waitForDeployment();

  const address = await plantQuest.getAddress();
  console.log("PlantQuest deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments/localhost");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Get ABI from artifacts
  const artifactsPath = require("path").join(__dirname, "../artifacts/contracts/PlantQuest.sol/PlantQuest.json");
  const artifacts = require(artifactsPath);
  
  const deploymentInfo = {
    address,
    abi: artifacts.abi,
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "PlantQuest.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to:", path.join(deploymentsDir, "PlantQuest.json"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
