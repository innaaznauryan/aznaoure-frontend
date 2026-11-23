import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/context/AuthContext";

export const SignInPromptModal = () => {
  const { signInPromptReason, closeSignInPrompt } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleSignIn = () => {
    closeSignInPrompt();
    navigate("/signin", { state: { from: location } });
  };

  return (
    <Dialog open={signInPromptReason !== null} onOpenChange={(open) => !open && closeSignInPrompt()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {t(signInPromptReason === "cart" ? "cart.signIn" : "favorites.signIn")}
          </DialogTitle>
          <DialogDescription>
            {t(signInPromptReason === "cart" ? "cart.signInDescription" : "favorites.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={closeSignInPrompt} className="w-full sm:w-auto">
            {t("favorites.cancel")}
          </Button>
          <Button variant="luxuryOutline" onClick={handleSignIn} className="w-full sm:w-auto">
            {t("favorites.signIn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
