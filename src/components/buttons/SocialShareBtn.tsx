import { Button } from "../ui/button";
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
import { EEventShareMedia, IEvent } from "@/types/event.types";
import { Input } from "../ui/input";

import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "react-share";
import { FaCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import { CiShare2 } from "react-icons/ci";
import axiosInstance from "@/lib/axiosInstance";

const SocialShareBtn: React.FC<{
  shareUrl: string;
  event: IEvent;
}> = ({ shareUrl, event }) => {
  // Helper to copy the link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
      await submitShareDate(EEventShareMedia.URL);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const submitShareDate = async (media: EEventShareMedia) => {
    try {
      await axiosInstance().post(`/api/events/${event._id}/share`, {
        media,
      });
    } catch {}
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <div className="flex gap-3 items-center">
            <CiShare2 /> <span>Share</span>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Share Url:</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex gap-5 items-center">
              <Input type="text" className="w-full" value={shareUrl} readOnly />
              <Button variant="outline" onClick={copyLink}>
                <FaCopy className="text-black" />
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <FacebookShareButton
                url={shareUrl}
                title={event.title}
                onClick={() => submitShareDate(EEventShareMedia.FACEBOOK)}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>

              <TwitterShareButton
                url={shareUrl}
                title={event.title}
                onClick={() => submitShareDate(EEventShareMedia.TWITTER)}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>

              <LinkedinShareButton
                url={shareUrl}
                title={event.title}
                summary={event.description}
                source={event.title}
                onClick={() => submitShareDate(EEventShareMedia.LINKEDIN)}
              >
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>

              <WhatsappShareButton
                url={shareUrl}
                title={event.title}
                onClick={() => submitShareDate(EEventShareMedia.WHATSAPP)}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SocialShareBtn;
