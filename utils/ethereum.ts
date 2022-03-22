import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import Airdrop from "../contracts/Airdrop.json";
import { networks } from "./Constant";

const isValidNetwork = async (isMobile) => {
  const provider:any = await detectEthereumProvider();
  const targetNetwork = networks[process.env.REACT_APP_NEXT_PUBLIC_NETWORK_ID];
  const message = `Wrong network, please switch to  ----- ${targetNetwork}`;
  const { ethereum } = window;
  if (!isMobile && !ethereum) {
    alert("Please install Metamask!");
  }
  if (isMobile) {
    return { valid: true };
  }
  if (provider) {
    const networkId = await provider.request({ method: "net_version" });
    if (networkId === process.env.REACT_APP_NEXT_PUBLIC_NETWORK_ID) {
      return { valid: true };
    } else {
      return { valid: false, message: message };
    }
  } else {
    return { valid: false, message: message };
  }
};
const getBlockchain = (onboard) =>
  new Promise(async (resolve, reject) => {
    // console.log("----process.env----",process.env);
    const provider:any = await detectEthereumProvider();
    if (provider) {
      const networkId = await provider.request({ method: "net_version" });
      // console.log("networkId",networkId)
      /*f(networkId !== process.env.REACT_APP_NEXT_PUBLIC_NETWORK_ID) {
        const targetNetwork = networks[process.env.REACT_APP_NEXT_PUBLIC_NETWORK_ID];
        alert(`Wrong network, please switch to  ----- ${targetNetwork}`);
        return;
      }*/
      //console.log("onboard", onboard);
      //const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(provider);
      const {abi}:any =  Airdrop
      try {
        const airdrop = new web3.eth.Contract(abi, Airdrop.networks[networkId].address);
        resolve({ airdrop, accounts: [] });
        return;
      } catch (e:any) {
        reject("error:"+ e);
      }
    }
    reject("Install Metamask");
  });

const disconnect = async () => {
  const {ethereum}:any = window
  const res = await ethereum.request({
    method: "eth_requestAccounts",
    params: [{ eth_accounts: {} }],
  });
  //console.log("res", res);
  return { success: false };
};

const getContactProvider = async (wallet) => {
  const networkId = await wallet?.provider?.request({ method: "net_version" });
  const web3 = new Web3(wallet.provider);
  const {abi}:any =  Airdrop

  const airdrop = new web3.eth.Contract(abi, Airdrop.networks[networkId].address);
  return airdrop;
};

export { getBlockchain, disconnect, isValidNetwork, getContactProvider };
