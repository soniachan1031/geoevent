import { createRef, useState } from "react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import getErrorMsg from "@/lib/getErrorMsg";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BsStars } from "react-icons/bs";
import axiosInstance from "@/lib/axiosInstance";

type AIEventDescriptionHelperBtnProps = {
  eventTitle?: string;
  onSuggestionApproval?: (text: string) => void;
};

export default function AIEventDescriptionHelperBtn({
  eventTitle,
  onSuggestionApproval,
}: Readonly<AIEventDescriptionHelperBtnProps>) {
  const cancelBtnRef = createRef<HTMLButtonElement>();
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

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
    setSuggestion(null);
    setUserPrompt(null);
    // Close the dialog
    cancelBtnRef.current?.click();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full h-7 w-7 flex items-center justify-center animate-pulse"
          title="Generate event description"
        >
          <BsStars />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Let Leo help you!</AlertDialogTitle>
          <AlertDialogDescription>
            <p>Enter event details below, and we’ll generate a description:</p>

            <textarea
              className="w-full p-2 border rounded-lg mt-2"
              placeholder="E.g. The event is a fundraiser for local schools..."
              value={userPrompt ?? ""}
              onChange={(e) => setUserPrompt(e.target.value)}
            />

            <Button
              variant="default"
              loading={loading}
              loaderProps={{ color: "white" }}
              className="mt-2"
              onClick={handleSuggestionGeneration}
              disabled={loading}
            >
              Generate Suggestion
            </Button>

            {suggestion && (
              <div className="mt-4">
                <p className="font-semibold">AI Suggestion:</p>
                <div className="max-h-[300px] overflow-auto">
                  <textarea
                    className="w-full p-2 border rounded-lg mt-2 bg-gray-50"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    rows={8}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelBtnRef}>Cancel</AlertDialogCancel>
          {suggestion && (
            <Button onClick={handleAcceptSuggestion} disabled={loading}>
              Accept Suggestion
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
