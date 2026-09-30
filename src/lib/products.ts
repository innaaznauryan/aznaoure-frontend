export type Category = "rings" | "necklaces" | "earrings" | "bracelets" | "brooches" | "others";

type TranslatedString = {
  en: string
  hy: string
}

export interface Product {
  id: string;
  name: TranslatedString;
  price: number;
  category: Category;
  image: string;
  description: TranslatedString;
  details: TranslatedString[];
  available: number;
  featured?: boolean;
}

export const categories: Record<
  Category,
  {
    name: TranslatedString
    description: TranslatedString
  }
> = {
  rings: {
    name: {
      en: "Rings",
      hy: "Մատանիներ"
    },
    description: {
      en: "Timeless elegance for every occasion",
      hy: "Ժամանակից դուրս նրբագեղություն"
    }
  },
  necklaces: {
    name: {
      en: "Necklaces",
      hy: "Կախազարդեր"
    },
    description: {
      en: "Graceful pendants and chains",
      hy: "Նրբաճաշակ կախազարդեր և շղթաներ"
    }
  },
  earrings: {
    name: {
      en: "Earrings",
      hy: "Ականջօղեր"
    },
    description: {
      en: "From subtle studs to statement pieces",
      hy: "Նուրբ փուսեթներից մինչև աչքի ընկնող ինքնատիպ ականջօղեր"
    }
  },
  bracelets: {
    name: {
      en: "Bracelets",
      hy: "Թևնոցներ"
    },
    description: {
      en: "Wrist adornments of distinction",
      hy: "Նրբագեղ ապարանջաններ"
    }
  },
  brooches: {
    name: {
      en: "Brooches",
      hy: "Կրծքազարդեր"
    },
    description: {
      en: "Elegant brooches to add a refined touch",
      hy: "Շքեղ շեշտադրման համար"
    }
  },
  others: {
    name: {
      en: "Other",
      hy: "Այլ"
    },
    description: {
      en: "Discover pieces beyond the familiar",
      hy: "Բացահայտեք յուրահատուկ ստեղծագործություններ"
    }
  }
}
