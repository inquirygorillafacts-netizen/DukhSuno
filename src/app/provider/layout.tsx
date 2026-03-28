import React from "react";
import ProviderLayout from "@/components/provider/ProviderLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProviderLayout>{children}</ProviderLayout>;
}
