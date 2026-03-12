import { CompilerConfig } from "@ton/blueprint";

export const compile: CompilerConfig = {
  lang: "tact",
  target: "contracts/arenapay_router.tact",
  options: {
    debug: true,
  },
};
