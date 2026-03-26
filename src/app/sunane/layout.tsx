import React from "react";
import SpeakerLayout from "@/components/speaker/SpeakerLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SpeakerLayout>{children}</SpeakerLayout>;
}
