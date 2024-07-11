import { ethers } from "ethers";

export function EthInput({ value, onChange }) {
  const ethValue = ethers.utils.formatEther(value);

  const handleInput = (e) => {
    const { value } = e.target;

    const weiValue = ethers.utils.parseEther(value);
    onChange(weiValue);
  };

  return (
    <label>
      Amount (in ETH)
      <input
        type="text"
        value={ethValue}
        onChange={handleInput}
        placeholder="0.0"
        className="input"
      />
    </label>
  );
}
