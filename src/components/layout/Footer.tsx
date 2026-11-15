import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";
import { categories } from "@/lib/products";
import { getLang } from "@/lib/get-lang.ts";
import { getMediaUrl } from "@/api/client.ts";

const logo = getMediaUrl("images/logo.webp")

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const lang = getLang(i18n.language);

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <h2>
              <img src={logo} alt="logo" className="w-32 object-cover"/>
            </h2>
            <p className="text-background/70 font-light leading-relaxed text-sm sm:text-base">
              {t("footer.description")}
            </p>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h3 className="font-sans text-xs tracking-widest uppercase text-background/50">
              {t("navigation.collections")}
            </h3>
            <ul className="space-y-3">
              {Object.entries(categories).map(([id, category]) => (
                <li key={id}>
                  <Link
                    to={`/collections?category=${id}`}
                    className="text-background/70 hover:text-background transition-colors duration-300"
                  >
                    {category.name[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-sans text-xs tracking-widest uppercase text-background/50">
              {t("footer.company")}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t("about.title"), href: "/about" },
                { label: t("navigation.home"), href: "/" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-background/70 hover:text-background transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-sans text-xs tracking-widest uppercase text-background/50">
              {t("navigation.contact")}
            </h3>
            <address className="text-background/70 not-italic space-y-2">
              <p className="pt-2">(+374) 93 629 370</p>
              <p>aznaoure@gmail.com</p>
            </address>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-background/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link
                to="https://www.instagram.com/aznaoure"
                target="_blank"
                className="text-background/50 hover:text-background transition-colors duration-300"
            >
              <Instagram />
            </Link>
            <Link
                to="https://www.facebook.com/aznaoure"
                target="_blank"
                className="text-background/50 hover:text-background transition-colors duration-300"
            >
              <Facebook />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
