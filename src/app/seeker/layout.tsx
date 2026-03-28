import React from "react";
import SeekerLayout from "@/components/seeker/SeekerLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SeekerLayout>{children}</SeekerLayout>;
}
