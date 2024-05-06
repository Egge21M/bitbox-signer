import { ChangeEvent, useEffect, useRef, useState } from "react";
import * as bitbox from "bitbox-api";
import { signMessage } from "./utils";

const encoder = new TextEncoder();

function App() {
  const [device, setDevice] = useState<bitbox.PairedBitBox>();
  const [keypathObj, setKeypathObj] = useState<{
    addressIndex: number;
    accountIndex: number;
    purpose: number;
  }>({ addressIndex: 0, accountIndex: 0, purpose: 84 });
  const [pairingCode, setParingCode] = useState("");
  const [address, setAddress] = useState("");
  const [result, setResult] = useState("");

  const scriptConfig: bitbox.BtcScriptConfig = { simpleType: "p2wpkh" };
  const keypath = `m/${keypathObj.purpose}'/0'/${keypathObj.accountIndex}'/0/${keypathObj.addressIndex}`;

  const messageRef = useRef<HTMLInputElement>(null);

  async function connectDevice() {
    const onClose = () => {
      setDevice(undefined);
    };
    const unpaired = await bitbox.bitbox02ConnectAuto(onClose);
    const pairing = await unpaired.unlockAndPair();
    const code = pairing.getPairingCode();
    if (code) {
      setParingCode(code);
    }
    const bb = await pairing.waitConfirm();
    setDevice(bb);
  }

  async function getAddress() {
    const add = await device?.btcAddress("btc", keypath, scriptConfig, false);
    if (add) {
      setAddress(add);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (device) {
        getAddress();
      }
    }, 1000);
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [device, keypathObj]);

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center">
      <h1>BitBox Signer</h1>
      <p className="text-zinc-600 text-xs max-w-sm text-center mb-12 mt-4">
        This is an open source project built with 🧡 by Egge. You can find the
        license{" "}
        <a href="https://github.com/Egge21M/bitbox-signer/blob/main/LICENSE.md">
          here
        </a>
        . There is no affiliation with BitBox Swiss or Swiss Crypto
      </p>

      {!device ? (
        <div>
          <button
            onClick={connectDevice}
            className="rounded py-2 px-4 bg-zinc-600 text-white"
          >
            Connect Device
          </button>
          {pairingCode && !device ? <p>{pairingCode}</p> : undefined}
        </div>
      ) : (
        <div className="flex flex-col gap-4 justify-center items-center">
          <label>Address Index</label>
          <input
            className="p-2 rounded bg-zinc-600 text-white"
            type="number"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setKeypathObj({
                ...keypathObj,
                addressIndex: e.target.valueAsNumber,
              });
            }}
            value={keypathObj.addressIndex}
          />
          <label>Account Index</label>
          <input
            className="p-2 rounded bg-zinc-600 text-white"
            type="number"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setKeypathObj({
                ...keypathObj,
                accountIndex: e.target.valueAsNumber,
              });
            }}
            value={keypathObj.accountIndex}
          />
          {address ? <p>{address}</p> : undefined}
          <label>Message</label>
          <input
            className="p-2 rounded bg-zinc-600 text-white"
            ref={messageRef}
          />
          <button
            className="rounded py-2 px-4 bg-zinc-600 text-white"
            onClick={async () => {
              if (messageRef && messageRef.current && device) {
                const result = await signMessage(
                  device,
                  scriptConfig.simpleType,
                  keypath,
                  encoder.encode(messageRef.current.value),
                );
                console.log(result);
                const decoded = result.sig
                  //@ts-ignore
                  .map((byte) => byte.toString(16).padStart(2, "0"))
                  .join("");
                setResult(decoded);
              }
            }}
          >
            Sign
          </button>
          {result ? (
            <p className="max-w-sm break-words">{result}</p>
          ) : undefined}
        </div>
      )}
    </div>
  );
}

export default App;
