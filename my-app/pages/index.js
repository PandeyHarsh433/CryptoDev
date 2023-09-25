import React, { useRef, useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "@/constants";
import Head from "next/head";

const Index = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [numTokenMinted, setNumTokenMinted] = useState("");
  const web3ModalRef = useRef();

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const owner = await nftContract.owner();
      const userAddress = await signer.getAddress();

      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getNumMintedToken = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const numTokenIds = await nftContract.tokenIds();
      setNumTokenMinted(numTokenIds);
    } catch (error) {
      console.log(error);
    }
  };

  const startPresale = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.startPresale();
      await txn.wait();

      setPresaleStarted(true);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const presaleMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.005"),
      });

      await txn.wait();
      window.alert("You successfully minted a CryptoDev...!!");
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const publicMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });

      await txn.wait();
      window.alert("You successfully minted a CryptoDev...!!");
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      // This will return a bignumber because presaleEnded is a uint256 and it will return a timestamp in seconds
      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000;

      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );

      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onPageLoad = async () => {
    await connectWallet();
    getOwner();

    const presaleStarted = await checkIfPresaleStarted();

    if (presaleStarted) {
      await checkIfPresaleEnded();
    }
    await getNumMintedToken();

    // Track in real time the number of minted nft's

    setInterval(async () => {
      await getNumMintedToken();
    }, 5 * 1000);

    // Track in real time the status of presale (started,ended,whatever)

    setInterval(async () => {
      const presaleStarted = await checkIfPresaleStarted();

      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5 * 1000);
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 11155111) {
      window.alert("Change the network to Sepolia");
      throw new Error("Change network to Sepolia");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const renderBody = () => {
    if (!walletConnected) {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect Your Wallet
        </button>
      );
    }
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale
        </button>
      );
    }
    if (!isOwner && !presaleStarted) {
      return (
        <div>
          <span className={styles.description}>
            Presale has not started yet. Come back later...!
          </span>
        </div>
      );
    }
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <span className={styles.description}>
            Presale has started..! If your address is whitelisted you can mint a
            cryptoDev...!
          </span>
          <button className={styles.button} onClick={presaleMint}>
            Presale mint
          </button>
        </div>
      );
    }
    if (presaleEnded) {
      return (
        <div>
          <span className={styles.description}>
            Presale has ended. You can mint a CryptoDev in public sale , if any
            left...!
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public mint
          </button>
        </div>
      );
    }
    if (loading) {
      return <span className={styles.description}>Loading...</span>;
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "Sepolia",
        providerOptions: {},
        disableInjectProvider: false,
      });

      onPageLoad();
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDev NFT...!</h1>
          <div className={styles.description}>
            CryptoDev NFT is s collection of developers in web3
          </div>
          <div className={styles.description}>
            {`${numTokenMinted}/20 have been minted already...!`}
          </div>
          <div>{renderBody()}</div>
        </div>
        <img src="/19.svg" className={styles.image} alt="" />
      </div>
      <footer>Made with &#10084; by Crypto Devs</footer>
    </div>
  );
};

export default Index;
