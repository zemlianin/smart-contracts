const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

describe("MyToken", function () {
    let Token, token, sender, receiver1, receiver2;

    beforeEach(async function () {
        // Get signers
        [sender, receiver1, receiver2] = await ethers.getSigners();

        // Deploy the contract
        Token = await ethers.getContractFactory("MyToken");
        token = await Token.deploy(ethers.parseUnits("10000", "ether")); // Mint 10,000 tokens
      //  await token.deployed();

        console.log(`ERC20Token deployed to: ${token.address}`);
    });

   it("Should allocate initial supply to the deployer", async function () {
        const deployerBalance = await token.balanceOf(sender.address);
        expect(deployerBalance).to.equal(ethers.parseUnits("10000", "ether"));
    });

    it("Should transfer tokens to Receiver_1 and check balances", async function () {
        const transferAmount = ethers.parseUnits("100", "ether");

        // Перевести токены Receiver_1
        await token.transfer(receiver1.address, transferAmount);

        // Проверить баланс Receiver_1
        const receiver1Balance = await token.balanceOf(receiver1.address);
        expect(receiver1Balance).to.equal(transferAmount);

        // Проверить оставшийся баланс отправителя (Sender)
        const senderBalance = await token.balanceOf(sender.address);
        expect(senderBalance).to.equal(ethers.parseUnits("9900", "ether"));
    });
    
    it("Should transfer tokens to Receiver_2 and check balances", async function () {
        const transferAmount = ethers.parseUnits("200", "ether");

        // Перевести токены Receiver_2
        await token.transfer(receiver2.address, transferAmount);

        // Проверить баланс Receiver_2
        const receiver2Balance = await token.balanceOf(receiver2.address);
        expect(receiver2Balance).to.equal(transferAmount);

        // Проверить оставшийся баланс отправителя (Sender)
        const senderBalance = await token.balanceOf(sender.address);
        expect(senderBalance).to.equal(ethers.parseUnits("9800", "ether"));
    });

    it("Should compute gas consumption for 100 transactions and export to CSV hash", async function () {
        const gasUsed = []; // Массив для хранения газа каждой транзакции
        const receiver = receiver1.address; // Получатель токенов
        let totalGasUsed = ethers.parseUnits("0", "ether"); // Общее потребление газа
    
        let csvContent = "Transaction,TransactionHash\n";
    
        for (let i = 1; i <= 100; i++) {
            const transferAmount = ethers.parseUnits(i.toString(), "ether"); // Увеличивающаяся сумма
    
            const tx = await token.transfer(receiver, transferAmount);
            const receipt = await tx.wait();
    
            gasUsed.push(receipt.gasUsed);
            totalGasUsed = totalGasUsed+receipt.gasUsed; // Суммируем газ
    
            console.log(`Total Gas Used: ${totalGasUsed.toString()}`);
            console.log(`${tx.hash}`);

            // Добавляем строку в CSV с адресом транзакции
            csvContent += `${i},${tx.hash}\n`;
        }
    
        console.log(`Total Gas Used: ${totalGasUsed.toString()}`);
    
        // Записываем данные в CSV файл
        const outputPath = path.join(__dirname, "tr-addresses.csv");
        fs.writeFileSync(outputPath, csvContent, "utf8");
        console.log(`Gas usage data exported to ${outputPath}`);
    
        // Убедитесь, что выполнено 100 транзакций
        expect(gasUsed.length).to.equal(100);
    });
});
