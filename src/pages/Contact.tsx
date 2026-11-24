import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const preorderProductId = searchParams.get("preorder");
  const preorderProductName = searchParams.get("productName") || preorderProductId || "";
  const preorderMessage = preorderProductId
    ? t("contact.preorderMessage", {
        productName: preorderProductName,
        productId: preorderProductId,
      })
    : "";

  const showSuccess = () => {
    toast({
      title: t("contact.success.title"),
      description: t("contact.success.description"),
    });
  };

  const showError = () => {
    toast({
      title: t("contact.error.title"),
      description: t("contact.error.description"),
      variant: "destructive",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("_subject", preorderProductId
      ? t("contact.preorderSubject", { productName: preorderProductName })
      : `New message from ${form.firstName.value} ${form.lastName.value} on Aznaoure website`);

    try {
      const response = await fetch(import.meta.env.VITE_FORMSPREE_ENDPOINT,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        })
      if (!response.ok) {
        await response.json().catch(() => null);
        throw new Error("Submission failed");
      }

      form.reset();
      showSuccess();
    } catch (error) {
      showError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Meta tags */}
      <SEO
        title="Contact Us"
        description="Get in touch with Aznaoure Art for questions, custom orders, or support."
        path="/contact"
      />

      {/* Hero */}
      <section className="py-12 sm:py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="luxury-subheading mb-3 sm:mb-4">{t("contact.subtitle")}</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">
              {t("contact.title")}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
              {t("contact.description")}
            </p>
            <div className="luxury-divider mt-6 sm:mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl mb-6 sm:mb-8">
                  {t("contact.visit")}
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex gap-4">
                    <Facebook className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">Facebook</p>
                      <Link
                        className="text-muted-foreground"
                        to="https://www.facebook.com/aznaoure"
                        target="_blank"
                      >
                        Aznaoure Art
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Instagram className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">Instagram</p>
                      <Link
                          className="text-muted-foreground"
                          to="https://www.instagram.com/aznaoure"
                          target="_blank"
                      >
                        Aznaoure Art
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t("contact.phone")}</p>
                      <Link
                        className="text-muted-foreground"
                        to="tel:+37493629370"
                      >
                        (+374) 93 629 370
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t("contact.email.label")}</p>
                      <Link
                        to="mailto:aznaoure@gmail.com"
                        className="text-muted-foreground"
                      >
                        aznaoure@gmail.com
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-2xl sm:text-3xl mb-6 sm:mb-8">
                {t("contact.sendMessage")}
              </h2>

              <form
                key={user?.id ?? "guest"}
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="firstName">{t("contact.fName.label")}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      defaultValue={user?.first_name ?? ""}
                      placeholder={t("contact.fName.placeholder")}
                      className="mt-2"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t("contact.lName.label")}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      defaultValue={user?.last_name ?? ""}
                      placeholder={t("contact.lName.placeholder")}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">{t("contact.email.label")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={user?.email ?? ""}
                    placeholder={t("contact.email.placeholder")}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{t("contact.phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    defaultValue={user?.phone ?? ""}
                    placeholder="(+374) 00 000 000"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="message">{t("contact.message.label")}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder={t("contact.message.placeholder")}
                    rows={6}
                    className="mt-2 resize-none"
                    defaultValue={preorderMessage}
                  />
                </div>

                <Button
                  type="submit"
                  variant="luxury"
                  size="lg"
                  className="sm:size-xl w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("contact.sending") : t("contact.send")}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
