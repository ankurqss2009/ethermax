/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack5: true,
  env: {
    REACT_APP_INFURA:process.env.REACT_APP_INFURA,
    REACT_APP_NEXT_PUBLIC_NETWORK_ID:process.env.REACT_APP_NEXT_PUBLIC_NETWORK_ID,
    REACT_APP_PRIVATE_KEY:process.env.REACT_APP_PRIVATE_KEY,
    REACT_APP_TOKEN_SYMBOL:process.env.REACT_APP_TOKEN_SYMBOL,
    REACT_APP_WRONG_ADDRESS:process.env.REACT_APP_WRONG_ADDRESS,
    REACT_APP_CLAIM_TX_LINK:process.env.REACT_APP_CLAIM_TX_LINK,
    REACT_APP_Onboard_ChainId:process.env.REACT_APP_Onboard_ChainId
  }
};

module.exports = nextConfig;
