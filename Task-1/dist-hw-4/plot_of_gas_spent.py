from web3 import Web3
import pandas as pd
import matplotlib.pyplot as plt

# I worked from server and it is server-ip.
web3 = Web3(Web3.HTTPProvider("http://194.87.186.59:8545"))

if web3.is_connected():
    print("Connected to local Hardhat network")
else:
    print("Failed to connect to network")
    exit()

data = pd.read_csv("tr-addresses.csv")

gas_data = []

for index, row in data.iterrows():
    tx_hash = row["TransactionHash"]
    try:
        receipt = web3.eth.get_transaction_receipt(tx_hash)
        gas_used = receipt["gasUsed"]
        gas_data.append({"Transaction": row["Transaction"], "GasUsed": gas_used})
        print(f"Transaction {row['Transaction']}: Gas Used = {gas_used}")
    except Exception as e:
        print(f"Failed to fetch transaction {row['Transaction']}: {e}")
        gas_data.append({"Transaction": row["Transaction"], "GasUsed": None})

gas_df = pd.DataFrame(gas_data)

gas_df.dropna(subset=["GasUsed"], inplace=True)

gas_df.to_csv("processed_gas_usage.csv", index=False)

plt.figure(figsize=(10, 6))
plt.plot(gas_df["Transaction"], gas_df["GasUsed"], marker="o", linestyle="-", label="Gas Used")
plt.title("Gas Consumption per Transaction")
plt.xlabel("Transaction Number")
plt.ylabel("Gas Used")
plt.grid(True)
plt.legend()
plt.show()
