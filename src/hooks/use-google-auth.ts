import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/api/client.ts";
import { googleAuth } from "@/api/auth.ts";
import { useAuth } from "@/context/AuthContext";

export function useGoogleAuth(from = "/") {
  const { t } = useTranslation();
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSuccess = async ({
                                       credential,
                                     }: {
    credential?: string;
  }) => {
    if (!credential) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      const data = await googleAuth(credential);

      setAuth(data.access_token, data.refresh_token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      const code =
        err instanceof ApiError ? err.code : "network_error";

      setFormError(t(`authErrors.${code}`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setFormError(t("authErrors.network_error"));
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
    formError,
    setFormError,
    isSubmitting,
  };
}