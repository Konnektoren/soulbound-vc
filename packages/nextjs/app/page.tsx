"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import deployedContracts from "../contracts/deployedContracts";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount, useContractRead, useWriteContract } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [performance, setPerformance] = useState("");
  const [performanceJson, setPerformanceJson] = useState("");
  const [hash, setHash] = useState("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  useEffect(() => {
    const json = JSON.stringify({ performance });
    setPerformanceJson(json);
    setHash(ethers.id(json));
  }, [performance]);

  const { data, error, isPending, writeContract } = useWriteContract();

  const issueCredential = () => {
    writeContract({
      address: deployedContracts[31337].SoulBoundVC.address,
      abi: deployedContracts[31337].SoulBoundVC.abi,
      functionName: "issue",
      args: [connectedAddress ?? "", ethers.id(performanceJson)],
    });
  };

  const { data: verificationData, refetch: refetchVerification } = useContractRead({
    address: deployedContracts[31337].SoulBoundVC.address,
    abi: deployedContracts[31337].SoulBoundVC.abi,
    functionName: "verify",
    args: [BigInt(tokenId ?? 0), ethers.id(performanceJson)],
  });

  console.log(verificationData);

  const verifyCredential = () => {
    refetchVerification().then(result => {
      setVerificationResult(result ? "Credential is valid" : "Credential is invalid");
    });
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <p className="text-center text-lg">
            Edit your smart contract{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              YourContract.sol
            </code>{" "}
            in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/hardhat/contracts
            </code>
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full mt-16 px-8 py-12 bg-white shadow-md rounded-lg">
          <h2 className="text-center text-2xl mb-4">Performance Input</h2>
          <div className="flex flex-col items-center">
            <input
              type="text"
              className="mb-4 p-2 border border-gray-300 rounded"
              placeholder="Enter performance"
              value={performance}
              onChange={e => setPerformance(e.target.value)}
            />
            <p>JSON: {performanceJson}</p>
            <p>Hash: {hash}</p>
            <button className="mt-4 p-2 bg-blue-500 text-white rounded" onClick={issueCredential}>
              {isPending ? "Issuing..." : "Issue Credential"}
            </button>
            {isPending && <p>Transaction is pending...</p>}
            {data && <p>Transaction successful!</p>}
            {error && <p>Transaction failed: {error.message}</p>}
          </div>
          <div className="w-full mt-16 px-8 py-12 bg-white shadow-md rounded-lg">
            <h2 className="text-center text-2xl mb-4">Verify Credential</h2>
            <div className="flex flex-col items-center">
              <input
                type="number"
                className="mb-4 p-2 border border-gray-300 rounded"
                placeholder="Enter token ID"
                value={tokenId ?? ""}
                onChange={e => setTokenId(Number(e.target.value))}
              />
              <button className="mt-4 p-2 bg-blue-500 text-white rounded" onClick={verifyCredential}>
                Verify Credential
              </button>
              {verificationResult && <p>{verificationResult}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
