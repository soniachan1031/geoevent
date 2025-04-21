import { useState } from "react";
import { Button } from "../ui/button";
import { BsStars } from "react-icons/bs";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance";
import getErrorMsg from "@/lib/getErrorMsg";
import CustomModal from "../modals/CustomModal";

type AIEventDescriptionHelperBtnProps = {
  eventTitle?: string;
  onSuggestionApproval?: (text: string) => void;
};

export default function AIEventDescriptionHelperBtn({
  eventTitle,
  onSuggestionApproval,
}: Readonly<AIEventDescriptionHelperBtnProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setSuggestion(null);
    setUserPrompt(null);
  };

  const handleSuggestionGeneration = async () => {
    if (!userPrompt?.trim()) {
      toast.error("Please provide some event details first!");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance().post(
        "/api/ai/generate-event-description",
        {
          title: eventTitle,
          details: userPrompt,
        }
      );
      setSuggestion(response.data.data.description);
    } catch (error: any) {
      toast.error(getErrorMsg(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      onSuggestionApproval?.(suggestion);
    }
    handleClose();
  };

  return (
    <>
   <Button
  variant="ghost"
  onClick={() => setIsOpen(true)}
  title="Generate event description"
  className="relative flex items-center justify-start gap-2 text-primary text-sm px-3 py-1.5 rounded-md hover:bg-muted"
>
  {/* Icon positioned inside */}
  <span className="absolute top-1/2 left-2 -translate-y-1/2">
    <BsStars className="h-4 w-4" />
  </span>

  {/* Offset text so it doesn't overlap icon */}
  <span className="pl-5">Generate with AI</span>
</Button>



      <CustomModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Let Leo help you!"
        className="max-w-xl"
      >
        <p className="text-sm mb-2">
          Enter event details below, and we’ll generate a description:
        </p>

        <textarea
          className="w-full p-2 border rounded-lg mt-1"
          placeholder="E.g. The event is a fundraiser for local schools..."
          value={userPrompt ?? ""}
          onChange={(e) => setUserPrompt(e.target.value)}
        />

        <Button
          variant="default"
          loading={loading}
          loaderProps={{ color: "white" }}
          className="mt-3"
          onClick={handleSuggestionGeneration}
          disabled={loading}
        >
          Generate Suggestion
        </Button>

        {suggestion && (
          <div className="mt-5">
            <p className="font-semibold">AI Suggestion:</p>
            <textarea
              className="w-full p-2 border rounded-lg mt-2 bg-gray-50"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              rows={8}
              disabled={loading}
            />
          </div>
        )}

        <div className="mt-6 flex justify-between items-center gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {suggestion && (
            <Button onClick={handleAcceptSuggestion} disabled={loading}>
              Accept Suggestion
            </Button>
          )}
        </div>
      </CustomModal>
    </>
  );
}
