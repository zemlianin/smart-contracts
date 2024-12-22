require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    polygon_amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: ["<secret>"],
    },
  },
  etherscan: {
    apiKey: "YWMKAZ4G9NTZ1P5CXGA8FUMWYTDNSBB2FQ",
  },
};
