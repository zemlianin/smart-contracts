const hre = require("hardhat");

async function wait(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function main() {
  const MMDLSCourse = await hre.ethers.getContractFactory("MMDLSCourse");
  const mmdlsCourse = await MMDLSCourse.deploy();

  await wait(20);

  await mmdlsCourse.waitForDeployment();
  
  console.log(`MMDLSCourse deployed to: ${await mmdlsCourse.getContractAddress()}`);
}



main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0xd33468097d69FD4296B766AB9eeeE794eF65e213
// https://amoy.polygonscan.com/address/0xd33468097d69FD4296B766AB9eeeE794eF65e213#writeContract