"use client";


import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import PopupModal from "./Rule_sub";


type NewsletterIslandProps = {
className: string; // behåll exakta knappklasser för stilen
label?: string; // standard: "Nyhetsbrev"
};


export default function NewsletterIsland({ className, label = "Nyhetsbrev" }: NewsletterIslandProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = useCallback(() => setIsModalOpen(true), []);
  const handleClose = useCallback(() => setIsModalOpen(false), []);


  return (
    <>
      <Button
        type="button"
        variant="link"
        className={className}
        onClick={handleOpen}
        aria-label="Öppna nyhetsbrevsanmälan"
      >
      {label}
      </Button>
      <PopupModal isOpen={isModalOpen} onClose={handleClose} />
    </>
  );
}