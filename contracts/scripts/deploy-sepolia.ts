import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // 使用提供的私钥创建签名者
  const privateKey = process.env.PRIVATE_KEY || "";
  const wallet = new ethers.Wallet(privateKey, ethers.provider);
  
  console.log("Deploying contracts with the account:", wallet.address);
  
  // 检查余额
  const balance = await ethers.provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Account has no balance. Please fund the account with Sepolia ETH.");
  }

  // 部署合约
  console.log("Deploying PlantQuest contract...");
  const PlantQuest = await ethers.getContractFactory("PlantQuest");
  const plantQuest = await PlantQuest.connect(wallet).deploy();

  console.log("Waiting for deployment confirmation...");
  await plantQuest.waitForDeployment();

  const address = await plantQuest.getAddress();
  console.log("✅ PlantQuest deployed to:", address);

  // 保存部署信息
  const deploymentsDir = path.join(__dirname, "../deployments/sepolia");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // 获取ABI
  const artifactsPath = path.join(__dirname, "../artifacts/contracts/PlantQuest.sol/PlantQuest.json");
  const artifacts = JSON.parse(fs.readFileSync(artifactsPath, "utf-8"));
  
  const deploymentInfo = {
    address,
    abi: artifacts.abi,
    deployer: wallet.address,
    network: "sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
  };

  const deploymentPath = path.join(deploymentsDir, "PlantQuest.json");
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📝 Deployment info saved to:", deploymentPath);
  console.log("\n📋 Deployment Summary:");
  console.log("   Network: Sepolia Testnet");
  console.log("   Contract Address:", address);
  console.log("   Deployer Address:", wallet.address);
  console.log("   Explorer: https://sepolia.etherscan.io/address/" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

