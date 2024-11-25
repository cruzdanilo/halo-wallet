"use client";

import { execHaloCmdWeb } from "@arx-research/libhalo/api/web";
import { Core } from "@walletconnect/core";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { WalletKit } from "@reown/walletkit";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClientRestore, persistQueryClientSubscribe } from "@tanstack/query-persist-client-core";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { Metadata } from "next";
import React, { type ReactNode } from "react";
import * as chains from "viem/chains";
import { deserialize, serialize } from "wagmi";
import { structuralSharing } from "wagmi/query";

import "./globals.css";

const metadata = { title: "halo wallet", description: "own your arx halo" } as const satisfies Metadata;

const ssr = typeof window === "undefined";
const persister = createAsyncStoragePersister({ serialize, deserialize, storage: ssr ? undefined : localStorage });
const queryClient = new QueryClient({ defaultOptions: { queries: { structuralSharing } } });
if (!ssr) {
  persistQueryClientRestore({ queryClient, persister, maxAge: Infinity }).catch((error: unknown) => {
    console.error(error);
  });
  persistQueryClientSubscribe({ queryClient, persister });
}
queryClient.setQueryDefaults(["halo"], {
  retry: false,
  staleTime: Infinity,
  gcTime: Infinity,
  queryFn: async () => {
    const nfcResult = await execHaloCmdWeb({ name: "get_pkeys" }, { statusCallback: console.log, method: "webnfc" }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    // const recipientAddress = nfcResult.etherAddresses["1"];
    console.log(nfcResult);
  },
});

const core = new Core({ projectId: "b1c9a88c2235b8537021ae6af2f1b738" });
const walletKitPromise = WalletKit.init({
  core,
  metadata: {
    name: metadata.title,
    description: metadata.description,
    url: "https://halo-wallet-omega.vercel.app",
    icons: [],
  },
}).then((walletKit) => {
  console.log("initialized");
  walletKit.on("session_proposal", ({ id, params }) => {
    console.log("session_proposal", id, params);
    walletKit
      .approveSession({
        id,
        namespaces: buildApprovedNamespaces({
          proposal: params,
          supportedNamespaces: {
            eip155: {
              chains: Object.values(chains).map((chain) => `eip155:${chain.id}`),
              methods: ["eth_signTypedData_v4"],
              events: ["accountsChanged", "chainChanged"],
              accounts: Object.values(chains).map(
                (chain) => `eip155:${chain.id}:0x3385d05d882AE69809CC4f76965375A83A4D816B`,
              ),
            },
          },
        }),
      })
      .then((session) => {
        console.log(session);
      })
      .catch((error: unknown) => {
        console.error("session_proposal", error);
        return walletKit.rejectSession({ id, reason: getSdkError("USER_REJECTED") });
      });
  });
  return walletKit;
});

queryClient.setQueryDefaults(["walletKit"], {
  retry: false,
  staleTime: Infinity,
  gcTime: Infinity,
  queryFn: () => walletKitPromise,
});
queryClient.prefetchQuery({ queryKey: ["walletKit"] }).catch(() => undefined);

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
          {children}
        </PersistQueryClientProvider>
      </body>
    </html>
  );
}
