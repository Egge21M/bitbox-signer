import {
  PairedBitBox,
  BtcScriptConfig,
  BtcScriptConfigWithKeypath,
  BtcSimpleType,
  Keypath,
} from "bitbox-api";

export async function signMessage(
  bb02: PairedBitBox,
  simpleType: BtcSimpleType,
  keypath: Keypath,
  message: Uint8Array,
) {
  const coin = "btc";

  const scriptConfig: BtcScriptConfig = { simpleType };
  const scriptConfigWKeypath: BtcScriptConfigWithKeypath = {
    scriptConfig,
    keypath,
  };

  const signature = await bb02.btcSignMessage(
    coin,
    scriptConfigWKeypath,
    message,
  );
  return signature;
}
