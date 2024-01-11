const { connect } = nearAPI;

const connectionConfig = {
    networkId: "mainnet",
    keyStore: myKeyStore, // first create a key store
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://wallet.mainnet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://explorer.mainnet.near.org",
};
const nearConnection = await connect(connectionConfig);

const contract = new Contract(account, "example-contract.testnet", {
    viewMethods: ["view_method_name"],
});
const response = await contract.view_method_name();

