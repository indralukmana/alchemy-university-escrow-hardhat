import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";
import { EthInput } from "./components/eth-input";
import { AddressInput } from "./components/address-input";

export async function approve(escrowContract, signer) {
  try {
    const approveTxn = await escrowContract.connect(signer).approve();
    await approveTxn.wait();
  } catch (error) {
    alert("Error approving contract " + error.message);
  }
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [signer, setSigner] = useState(null);
  const [signerAddress, setSignerAddress] = useState("");

  const [wei, setWei] = useState(ethers.utils.parseEther("0.001"));
  const [beneficiary, setBeneficiary] = useState("");
  const [arbiter, setArbiter] = useState("");

  useEffect(() => {
    const handleAccountsChange = async () => {
      try {
        const account = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (account.length > 0) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          const signer = provider.getSigner();

          setSigner(signer);
          const address = await signer.getAddress();

          setSignerAddress(address);
        } else {
          setSigner(null);
          setSignerAddress("");
        }
      } catch (e) {
        console.log("Error getting accounts");
        console.log(e);
      }
    };

    // Check for account changes right away
    handleAccountsChange();

    // Setup the event listener
    window.ethereum.on("accountsChanged", handleAccountsChange);

    // Cleanup the event listener on unmount
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChange);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  function isValidETHAddress(address) {
    // Regex to check a valid Ethereum address
    let regex = /^(0x)?[0-9a-fA-F]{40}$/;

    // If address is empty, return false
    if (!address) {
      return false;
    }

    // Return true if the address matches the regex
    return regex.test(address);
  }

  async function newContract() {
    if (!isValidETHAddress(arbiter)) {
      alert("Invalid Arbiter Address");
      return;
    }

    if (!isValidETHAddress(beneficiary)) {
      alert("Invalid Beneficiary Address");
      return;
    }

    try {
      const escrowContract = await deploy(signer, arbiter, beneficiary, wei);

      const escrow = {
        address: escrowContract.address,
        arbiter,
        beneficiary,
        value: wei,
        handleApprove: async () => {
          try {
            escrowContract.on("Approved", () => {
              document.getElementById(escrowContract.address).className =
                "complete";
              document.getElementById(escrowContract.address).innerText =
                "✓ It's been approved!";
            });

            await approve(escrowContract, signer);
          } catch (error) {
            alert("Error approving contract " + error.message);
          }
        },
      };

      setEscrows([...escrows, escrow]);
    } catch (error) {
      alert("Error deploying contract, " + error.message);
    }
  }

  async function handleLogout() {
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      setSigner(null);
      setSignerAddress("");
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLogin() {
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (error) {
      console.log("login error", error);
    }
  }

  return (
    <div className="main-container">
      <div className="contract">
        <h1> New Contract </h1>

        <section>
          <div>
            <h2>Current Account (Signer)</h2>
            <p>{signerAddress}</p>
            {signerAddress && (
              <div className="button" onClick={handleLogout}>
                Logout
              </div>
            )}
            {!signerAddress && (
              <div className="button" onClick={handleLogin}>
                Login
              </div>
            )}
          </div>
        </section>

        <AddressInput
          value={arbiter}
          onChange={setArbiter}
          label="Arbiter Address"
        />
        <AddressInput
          value={beneficiary}
          onChange={setBeneficiary}
          label="Beneficiary Address"
        />

        <EthInput value={wei} onChange={setWei} />

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
