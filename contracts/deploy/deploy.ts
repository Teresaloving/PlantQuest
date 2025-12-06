import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedPlantQuest = await deploy("PlantQuest", {
    from: deployer,
    log: true,
  });

  console.log(`PlantQuest contract deployed at: ${deployedPlantQuest.address}`);
};
export default func;
func.id = "deploy_plantQuest"; // id required to prevent reexecution
func.tags = ["PlantQuest"];
