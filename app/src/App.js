import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";
import { EthInput } from "./components/eth-input";
import { AddressInput } from "./components/address-input";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  const [wei, setWei] = useState("0");
  const [beneficiary, setBeneficiary] = useState("");
  const [arbiter, setArbiter] = useState("");

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    const escrowContract = await deploy(signer, arbiter, beneficiary, wei);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: wei,
      handleApprove: async () => {
        escrowContract.on("Approved", () => {
          document.getElementById(escrowContract.address).className =
            "complete";
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>

        <section>
          <div>
            <h2>Current Account (Depositor)</h2>
            <p>{account}</p>
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
    </>
  );
}

export default App;
