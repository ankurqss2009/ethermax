import Head from "next/head";
import React, { useState, useEffect } from "react";
//import Image from "next/image";
import { init, useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import  axios from 'axios'

/*
import injectedModule from "@web3-onboard/injected-wallets";
import trezorModule from "@web3-onboard/trezor";
import ledgerModule from "@web3-onboard/ledger";
import walletConnectModule from "@web3-onboard/walletconnect";
import walletLinkModule from "@web3-onboard/walletlink";
import portisModule from "@web3-onboard/portis";
import fortmaticModule from "@web3-onboard/fortmatic";
import torusModule from "@web3-onboard/torus";
import keepkeyModule from "@web3-onboard/keepkey";
*/
import { getBlockchain, isValidNetwork, getContactProvider } from "../utils/ethereum";
/*
const injected = injectedModule();
const walletLink = walletLinkModule();
const walletConnect = walletConnectModule();
*/

import { networks } from "../utils/Constant";
import { changeNetwork, getTokenByAddress } from "../utils/util";
import Web3 from "web3";
import { isMobile } from "react-device-detect";
import "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import styles from "../styles/Home.module.css";
import  initWeb3Onboard from '../service/initWeb3Onboard';

declare let window: any;

/*
const portis = portisModule({
  apiKey: "b2b7586f-2b1e-4c30-a7fb-c2d1533b153b",
});
*/

/*
const initWeb3Onboard = init({
  wallets: [ledger, trezor, walletConnect, keepkey, walletLink, injected, fortmatic, portis, torus],
  chains: [
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: "https://mainnet.infura.io/v3/ababf9851fd845d0a167825f97eeb12b",
    },
    {
      id: "0x3",
      token: "tROP",
      label: "Ethereum Ropsten Testnet",
      rpcUrl: "https://ropsten.infura.io/v3/ababf9851fd845d0a167825f97eeb12b",
    },
    {
      id: "0x4",
      token: "rETH",
      label: "Ethereum Rinkeby Testnet",
      rpcUrl: "https://rinkeby.infura.io/v3/ababf9851fd845d0a167825f97eeb12b",
    },
    {
      id: "0x89",
      token: "MATIC",
      label: "Matic Mainnet",
      rpcUrl: "https://matic-mainnet.chainstacklabs.com",
    },
  ],
  appMetadata: {
    name: "Blocknative",
    icon: "<svg><svg/>",
    description: "Demo app for Onboard V2",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
    ],
  },
});

const fortmatic = fortmaticModule({
  apiKey: "pk_test_886ADCAB855632AA",
});
const torus = torusModule();
const ledger = ledgerModule();

const keepkey = keepkeyModule();

const trezorOptions = {
  email: "test@test.com",
  appUrl: "https://www.blocknative.com",
};

const trezor = trezorModule(trezorOptions);
*/

const Home = () => {
  const [first, setfirst] = useState(null);
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const connectedWallets = useWallets();
  const [web3Onboard, setWeb3Onboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [claimMessage, setClaimMessage] = useState({
    payload: undefined,
    type: undefined,
  });
  const [airdrop, setAirdrop] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);

  //console.log("process.env.REACT_APP_INFURA", process.env.REACT_APP_INFURA);
  const MAINNET_RPC_URL = process.env.REACT_APP_INFURA;

  useEffect(() => {
    setWeb3Onboard(initWeb3Onboard);
    //console.log("---wallet---", wallet);
  }, []);

  useEffect(() => {
    const init = async () => {

      //console.log("--process.env---",process.env)
      try {
        //console.log("connectedWallets.length", connectedWallets.length);
        const { airdrop, accounts = [] }:any = await getBlockchain(initWeb3Onboard);
        setAirdrop(airdrop);
        setAccounts(accounts[0]);
        setLoading(false);
      } catch (e) {
        setLoadingMessage(e);
      }
      if (typeof window.ethereum !== "undefined") {
        // Existing code goes here

        window?.ethereum?.on("accountsChanged", function (accounts) {
          console.log(`Selected account changed to ${accounts[0]}`);
           setAccounts(accounts[0]);
        });

        window?.ethereum?.on("chainChanged", () => {
          //window.location.reload();
        });
        /*window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });*/
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!connectedWallets.length) return;

    const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label);
    window.localStorage.setItem("connectedWallets", JSON.stringify(connectedWalletsLabelArray));
  }, [connectedWallets]);

  useEffect(() => {
    const setWalletFromLocalStorage = async (previouslyConnectedWallets)=> {
      let res = await connect({ autoSelect: previouslyConnectedWallets[0] });
      //console.log("----res--", res);
    }
    const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem("connectedWallets"));
    if (previouslyConnectedWallets?.length) {
      setWalletFromLocalStorage(previouslyConnectedWallets);
    }
  }, [web3Onboard, connect]);

  const claimTokens = async (e) => {
    if (loading) {
      return;
    }
    const address = wallet?.accounts[0]?.address || null;
    if (!address) {
      setClaimMessage({
        type: "danger",
        payload: `Please connect your wallet`,
      });
      return;
    }
    if (wallet) {
      let networkId = await wallet.provider.request({ method: "net_version" });
      if (process.env.REACT_APP_NEXT_PUBLIC_NETWORK_ID !== networkId) {
        setClaimMessage({
          type: "danger",
          payload: `Wrong network, please switch to - ${networks[process.env.REACT_APP_NEXT_PUBLIC_NETWORK_ID]}`,
        });
        return;
      }
    }

    setClaimMessage({
      type: "primary",
      payload: "Checking your address in whitelist...",
    });
    try {
      //const response = await getTokenByAddress(address);
      const response = await axios.post(
          '/api/authorization',
          {
            address
          }
      );

      if (!response.data.signature) {
        setClaimMessage({
          type: "danger",
          payload: `${process.env.REACT_APP_WRONG_ADDRESS}`,
        });
        return;
      }
      setLoading(true);
      setClaimMessage({
        type: "primary",
        payload: `
                  Claiming token from Airdrop contract...
                  Address: ${response.data.address}
                  Total Amount: $${Web3.utils.fromWei(response.data.totalAllocation.toString())} ${process.env.REACT_APP_TOKEN_SYMBOL} 
                `,
      });
      //const symbol = process.env.TOKEN_SYMBOL;
      const contract = await getContactProvider(wallet);
      /*const receipt = await contract.claimTokens(response.data.address,
                response.data.totalAllocation.toString(),
                response.data.signature)*/
      const receipt = await contract.methods.claimTokens(response.data.address, response.data.totalAllocation.toString(), response.data.signature).send({ from: address });

      //console.log("--receipt--", receipt);
      const txHashUrl = `${process.env.REACT_APP_CLAIM_TX_LINK}/${receipt.transactionHash}`;

      setClaimMessage({
        type: "primary",
        payload: `Airdrop success!
                  Tokens successfully in tx <a target="_blank" href=${txHashUrl}>${receipt.transactionHash}</a> 
                  Address: ${response.data.address}
                  Total Amount: ${response.data.totalAllocation.toString()}
                `,
      });
      setLoading(false);
    } catch (e) {
      setLoading(false);
      if (e.message === "Request failed with status code 401") {
        setClaimMessage({
          type: "danger",
          payload: `Airdrop failed
                    Reason: Address not registered`,
        });
        return;
      } else if (e.code === 4001) {
        setClaimMessage({
          type: "danger",
          payload: e.message,
        });
      } else {
        setClaimMessage({
          type: "danger",
          payload: `Airdrop failed
                    Reason" Airdrop already sent to ${address}`,
        });
      }
    }
  };

  const handleConnect = async (account: any) => {
    setClaimMessage({ type: "", payload: "" });
    let wallets:any = await connect({});
    if (wallets && wallets[0]?.accounts) {
      setAccounts(wallets[0]?.accounts[0]?.address);
    }
    const { valid, message } = await isValidNetwork(isMobile);
    if (!valid) {
      setClaimMessage({
        type: "danger",
        payload: message,
      });
      return;
    }
  };

  const handleDisconnect = async () => {
    /*const [primaryWallet] = initWeb3Onboard.state.get().wallets
        let res = await initWeb3Onboard.disconnectWallet()
        console.log("----res----",res)
        setAccounts(null);*/
    await disconnect(wallet);
    const connectedWalletsList = connectedWallets.map(({ label }) => label);
    window.localStorage.setItem("connectedWallets", null);
    localStorage.clear();
  };

  return (
      <div className={styles.container}>
        <Head>
          <title>New - emax</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="App">
          <div id="some-element"></div>
          <div className="header">
            <div className="logo">
              <img src="/Logo.png" alt="logo" className="inner_logo" />
            </div>
            <div className="right_btn">
              <img src="/secound_logo.png" alt="" className="inner_logo" />
              <div className="inner_btn">
                {!wallet && (
                    <button
                        className="connect_btn"
                        onClick={() => {
                          handleConnect(accounts);
                        }}
                    >
                      <span>{accounts || "Connect Wallet"}</span>
                    </button>
                )}
                {wallet && (
                    <button
                        className="connect_btn"
                        onClick={() => {
                          handleDisconnect();
                        }}
                    >
                      Disconnect
                    </button>
                )}
                <button
                    className="switch_network"
                    onClick={() => {
                      changeNetwork("EMAX");
                    }}
                >
                  Select Arbitrum Natwork
                </button>
              </div>
            </div>
          </div>
          <section className="btn_section">
            <div className="container">
              <div className="row">
                <div>
                  {typeof claimMessage.payload !== "undefined" ? (
                      <div
                          className={`alert alert-${claimMessage.type}`}
                          role="alert"
                      >
                    <span
                        style={{ whiteSpace: "pre" }}
                        dangerouslySetInnerHTML={{ __html: claimMessage.payload }}
                    ></span>
                      </div>
                  ) : (
                      ""
                  )}
                </div>
                <div className="col-12">
                  <div className="btn_inner_part">
                    <div className="max_btn">
                      <img src="/red_logo.png" alt="" className="inner_img" />
                      <button className="inner_btn">EthereumMax</button>
                    </div>
                    <div className="claim_back">
                      <div className="claim_btn">
                        <img
                            src="/white_logo.png"
                            alt=""
                            className="inner_img hover_hide"
                        />
                        <img
                            src="/red_btn_logo.png"
                            alt=""
                            className="inner_img hover_show"
                        />
                        <button className="inner_btn" onClick={claimTokens}>
                          {loading ? "Processing.." : "Claim!"}
                        </button>
                        {/*   {!accounts &&<button className="inner_btn" onClick={()=>{handleConnect(accounts)}}>Connect</button>}
                       */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
  );
};

export default Home;
