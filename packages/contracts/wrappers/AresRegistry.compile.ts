import { CompilerConfig } from "@ton/blueprint";

export const compile: CompilerConfig = {
  lang: "tact",
  target: "contracts/ares_registry.tact",
  options: {
    debug: true,
  },
};
