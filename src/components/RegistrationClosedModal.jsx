import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

const WHATSAPP_LINK = "https://chat.whatsapp.com/DAEBfNCeTy8FoLhxaQ5qN1";
const INSTAGRAM_LINK = "https://www.instagram.com/nits.esports/";

const RegistrationClosedModal = ({ open, onClose }) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 bg-black/80 z-[100000]"
        />

        {/* Content */}
        <DialogPrimitive.Content
          className="
            fixed left-1/2 top-1/2 z-[100001]
            w-full max-w-md -translate-x-1/2 -translate-y-1/2
            rounded-lg bg-background p-6 shadow-xl
          "
        >
          <DialogPrimitive.Title className="text-2xl font-orbitron text-center">
            Oops! Registration Closed 😕
          </DialogPrimitive.Title>

          <DialogPrimitive.Description className="text-center mt-3 text-muted-foreground">
            We’re sorry — registrations for this event are currently closed.
            <br />
            Join our community so you don’t miss it next time.
          </DialogPrimitive.Description>

          <div className="flex flex-col gap-3 mt-6">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => window.open(WHATSAPP_LINK, "_blank")}
            >
              Join WhatsApp Community
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => window.open(INSTAGRAM_LINK, "_blank")}
            >
              <Instagram size={18} />
              Follow us on Instagram
            </Button>

            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default RegistrationClosedModal;
