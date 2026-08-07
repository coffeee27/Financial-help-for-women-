// LanguageToggle.jsx
// A small pill toggle to switch the whole app between English and Hindi.
// Drop this into your header/navbar/dashboard.

import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const isHindi = i18n.language?.startsWith("hi");

  const toggleLanguage = () => {
    const next = isHindi ? "en" : "hi";
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      title="Switch language / भाषा बदलें"
      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
    >
      <span className={!isHindi ? "font-bold" : "opacity-50"}>EN</span>
      <span className="opacity-40">|</span>
      <span className={isHindi ? "font-bold" : "opacity-50"}>हिं</span>
    </button>
  );
}