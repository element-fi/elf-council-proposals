import { AddressesJsonFile } from "elf-council-tokenlist";
import { CoreVoting__factory } from "elf-council-typechain";
import fs from "fs";
import hre, { ethers } from "hardhat";

import { ProposalsJson } from "src/types";

import { providers } from "ethers";
import { getProposals } from "src/getProposals";
import { SNAPSHOT_SPACE_ID_GOERLI } from "src/snapshot";

const ALCHEMY_GOERLI_RPC_HOST =
  "https://eth-goerli.alchemyapi.io/v2/fBuOKVPGvseZZb0h8HyPIDqtKC7nslig";

const provider = new providers.JsonRpcProvider(ALCHEMY_GOERLI_RPC_HOST);

const addressesJson: AddressesJsonFile = require(`src/addresses/goerli.addresses.json`);
const currentProposalsJson: ProposalsJson = require(`src/proposals/goerli.proposals.json`);
const coreVotingContract = CoreVoting__factory.connect(
  addressesJson.addresses.coreVoting,
  provider
);

/**
 * The mapping of on-chain proposal ids to their corresponding snapshot proposal
 * id (off-chain).
 */
const snapshotIdsByProposalId: Record<string, string> = {
  "0": "0xa924bf8887e96f64eabf30a5026eb432bd03b6f055df017061a1e480cf477c9a",
  "6": "0x91a739c399ba1b95d9b38013bf5c42b4cb83b56272b322d86587193859371f12",
  "8": "0x71df6710e26894685f985ae303b4bd64eeaa080f3e91703dac6ae539f66b5dd0",
};

const targetsByProposalId: Record<string, string[]> = {
  "0": ["0x36687bdD319a78AB4b4347f3A7459Da235AFc4f4"],
  "6": ["0x36687bdD319a78AB4b4347f3A7459Da235AFc4f4"],
  "8": ["0x36687bdD319a78AB4b4347f3A7459Da235AFc4f4"],
};

const callDatasByProposalId: Record<string, string[]> = {
  "0": [
    "0x88b49b8364ec53acdd6f74efcba0de586952c40e23aa87d547d57fabb1ee21203b7b09ea",
  ],
  "6": [
    "0x88b49b8364ec53acdd6f74efcba0de586952c40e23aa87d547d57fabb1ee21203b7b09ea",
  ],
  "8": [
    "0x88b49b8364ec53acdd6f74efcba0de586952c40e23aa87d547d57fabb1ee21203b7b09ea",
  ],
};

(async function () {
  try {
    const newProposals = await getProposals(
      provider,
      coreVotingContract,
      snapshotIdsByProposalId,
      targetsByProposalId,
      callDatasByProposalId,
      currentProposalsJson.proposals.map((proposal) => proposal.proposalId)
    );

    const proposalsJson: ProposalsJson = {
      version: "0.0.0",
      snapshotSpace: SNAPSHOT_SPACE_ID_GOERLI,
      proposals: [...currentProposalsJson.proposals, ...newProposals],
    };
    const proposalsJsonString = JSON.stringify(proposalsJson, null, 2);
    console.log(proposalsJsonString);

    fs.writeFileSync(
      "src/proposals/goerli.proposals.json",
      proposalsJsonString
    );
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();