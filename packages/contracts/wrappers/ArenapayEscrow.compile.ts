import { CompilerConfig } from "@ton/blueprint";

export const compile: CompilerConfig = {
  lang: "tact",
  target: "contracts/arenapay_escrow.tact",
  options: {
    debug: true,
  },
};
