export type CTA = {
  label: string;
  url: string;
};

// Generic blank content used for non-home pages so they don't copy homepage defaults
export const defaultGenericContent: HomeContent = {
  hero: { heading: "", subtext: "", cta: { label: "", url: "" } },
  partneredBy: { logos: [] },
  whatWeDo: { title: "", items: [] },
  workshop: { title: "" },
  testimonials: { title: "", items: [] },
  team: { title: "", members: [] },
  faq: { title: "", items: [] },
  workshopPage: { title: "", subtitle: "", cohorts: [] }
};

export type Media = {
  kind: "image" | "video";
  src: string;
  poster?: string;
};

export type HeroBlock = {
  heading: string;
  subtext: string;
  cta: CTA;
  background?: Media;
  studentsCount?: number;
  avatars?: string[];
};

export type PartnerLogo = {
  src: string;
  alt: string;
  href?: string;
};

export type PartneredByBlock = {
  logos: PartnerLogo[];
  title?: string;
};

export type WhatWeDoItem = {
  title: string;
  text: string;
  cta?: CTA;
};

export type WhatWeDoBlock = {
  title: string;
  subtitle?: string;
  items: WhatWeDoItem[];
};

export type WorkshopFeature = {
  title: string;
  text: string;
  media?: Media;
  cta?: CTA;
};

export type WorkshopWho = {
  bullets: string[];
  cta?: CTA;
  priceLabel?: string;
  countdownLabel?: string;
  countdownTargetISO?: string;
};

export type WorkshopBlock = {
  title: string;
  subtitle?: string;
  leftFeature?: WorkshopFeature;
  rightFeature?: WorkshopFeature;
  handsOn?: WorkshopFeature;
  whoItsFor?: WorkshopWho;
  careerGrowth?: WorkshopFeature;
};

// Dedicated Workshop page schema (mirrors /workshop UI)
export type WorkshopPageCohort = {
  id: number;
  badge: string;
  img: string;
  title: string;
  description: string;
  fee: string;
  date: string;
  participantsCount?: number;
  avatars?: string[];
  ctaEnabled?: boolean;
  ctaUrl?: string;
};

export type WorkshopPageContent = {
  title: string;
  subtitle?: string;
  cohorts: WorkshopPageCohort[];
};

export type TestimonialItem = {
  name: string;
  role?: string;
  text?: string;
  avatar?: string;
  videoUrl?: string;
};

export type TestimonialsBlock = {
  title: string;
  subtitle?: string;
  seeMore?: CTA;
  items: TestimonialItem[];
  maxVisible?: number;
  highlightFirst?: boolean;
  heroImage?: string; // large image on the right in the teaser
  badgeLabel?: string; // small label like "TESTIMONIALS"
  leadQuote?: string; // large centered quote text
  featuredIndex?: number; // which item to feature on the right card
  heroVideo?: string; // optional featured video url
  heroPoster?: string; // optional poster image for the video
};

export type TeamMember = {
  name: string;
  role?: string;
  photo?: string;
  links?: {
    linkedin?: string;
    x?: string;
    github?: string;
    website?: string;
  };
};

export type TeamBlock = {
  title: string;
  subtitle?: string;
  members: TeamMember[];
  gridColumns?: { sm?: number; md?: number; lg?: number };
  maxVisible?: number;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQBlock = {
  title: string;
  subtitle?: string;
  items: FAQItem[];
};

export type HomeContent = {
  hero: HeroBlock;
  partneredBy?: PartneredByBlock;
  whatWeDo: WhatWeDoBlock;
  workshop: WorkshopBlock;
  testimonials?: TestimonialsBlock;
  team?: TeamBlock;
  faq?: FAQBlock;
  // Dedicated Workshop page content
  workshopPage?: WorkshopPageContent;
};

export type PageRecord = {
  slug: "home" | string;
  title: string;
  status: "draft" | "published";
  content: HomeContent;
  updatedAtISO: string;
};

export const HomeJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://aurora/schemas/home.json",
  type: "object",
  properties: {
    hero: {
      type: "object",
      properties: {
        heading: { type: "string" },
        subtext: { type: "string" },
        cta: {
          type: "object",
          properties: { label: { type: "string" }, url: { type: "string" } },
          required: ["label", "url"]
        },
        background: {
          type: "object",
          properties: {
            kind: { enum: ["image", "video"] },
            src: { type: "string" },
            poster: { type: "string" }
          },
          required: ["kind", "src"],
          additionalProperties: false
        },
        studentsCount: { type: "number" },
        avatars: { type: "array", items: { type: "string" } }
      },
      required: ["heading", "subtext", "cta"],
      additionalProperties: true
    },
    partneredBy: {
      type: "object",
      properties: {
        title: { type: "string" },
        logos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              src: { type: "string" },
              alt: { type: "string" },
              href: { type: "string" }
            },
            required: ["src", "alt"],
            additionalProperties: false
          }
        }
      },
      required: ["logos"],
      additionalProperties: false
    },
    whatWeDo: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              text: { type: "string" },
              cta: {
                type: "object",
                properties: { label: { type: "string" }, url: { type: "string" } },
                required: ["label", "url"],
                additionalProperties: false
              }
            },
            required: ["title", "text"],
            additionalProperties: false
          }
        }
      },
      required: ["title", "items"],
      additionalProperties: false
    },
    workshop: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        leftFeature: {
          type: "object",
          properties: {
            title: { type: "string" },
            text: { type: "string" },
            media: {
              type: "object",
              properties: { kind: { enum: ["image", "video"] }, src: { type: "string" }, poster: { type: "string" } },
              required: ["kind", "src"],
              additionalProperties: false
            },
            cta: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } }, required: ["label", "url"], additionalProperties: false }
          },
          required: ["title", "text"],
          additionalProperties: false
        },
        rightFeature: {
          type: "object",
          properties: {
            title: { type: "string" },
            text: { type: "string" },
            media: {
              type: "object",
              properties: { kind: { enum: ["image", "video"] }, src: { type: "string" }, poster: { type: "string" } },
              required: ["kind", "src"],
              additionalProperties: false
            },
            cta: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } }, required: ["label", "url"], additionalProperties: false }
          },
          required: ["title", "text"],
          additionalProperties: false
        },
        handsOn: {
          type: "object",
          properties: {
            title: { type: "string" },
            text: { type: "string" },
            media: {
              type: "object",
              properties: { kind: { enum: ["image", "video"] }, src: { type: "string" }, poster: { type: "string" } },
              required: ["kind", "src"],
              additionalProperties: false
            }
          },
          required: ["title", "text"],
          additionalProperties: false
        },
        whoItsFor: {
          type: "object",
          properties: {
            bullets: { type: "array", items: { type: "string" } },
            cta: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } }, required: ["label", "url"], additionalProperties: false },
            priceLabel: { type: "string" },
            countdownLabel: { type: "string" },
            countdownTargetISO: { type: "string" }
          },
          required: ["bullets"],
          additionalProperties: false
        },
        careerGrowth: {
          type: "object",
          properties: {
            title: { type: "string" },
            text: { type: "string" },
            media: {
              type: "object",
              properties: { kind: { enum: ["image", "video"] }, src: { type: "string" }, poster: { type: "string" } },
              required: ["kind", "src"],
              additionalProperties: false
            }
          },
          required: ["title", "text"],
          additionalProperties: false
        },
        
      },
      required: ["title"],
      additionalProperties: false
    },
    testimonials: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        seeMore: { type: "object", properties: { label: { type: "string" }, url: { type: "string" } }, required: ["label", "url"], additionalProperties: false },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              text: { type: "string" },
              avatar: { type: "string" },
              videoUrl: { type: "string" }
            },
            required: ["name"],
            additionalProperties: false
          }
        },
        maxVisible: { type: "number" },
        highlightFirst: { type: "boolean" },
        heroImage: { type: "string" },
        badgeLabel: { type: "string" },
        leadQuote: { type: "string" },
        featuredIndex: { type: "number" },
        heroVideo: { type: "string" },
        heroPoster: { type: "string" }
      },
      required: ["title", "items"],
      additionalProperties: false
    },
    team: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        members: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              photo: { type: "string" },
              links: {
                type: "object",
                properties: { linkedin: { type: "string" }, x: { type: "string" }, github: { type: "string" }, website: { type: "string" } },
                additionalProperties: false
              }
            },
            required: ["name"],
            additionalProperties: false
          }
        },
        gridColumns: { type: "object", properties: { sm: { type: "number" }, md: { type: "number" }, lg: { type: "number" } }, additionalProperties: false },
        maxVisible: { type: "number" }
      },
      required: ["title", "members"],
      additionalProperties: false
    },
    faq: {
      type: "object",
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        items: {
          type: "array",
          items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } }, required: ["question", "answer"], additionalProperties: false }
        }
      },
      required: ["title", "items"],
      additionalProperties: false
    }
  },
  required: ["hero", "whatWeDo", "workshop"],
  additionalProperties: false
} as const;

export const defaultHomeContent: HomeContent = {
  hero: {
    heading: "ACCELERATE YOUR\nROBOTICS CAREER",
    subtext: "Lorem ipsum dolor sit amet.",
    cta: { label: "Book Slot", url: "/book-slot" },
    background: { kind: "video", src: "/Image /Whisk_mtyzqjyhrgm1mwzj1in5emytuwzzqtl4imy30sy.mp4" },
    studentsCount: 53,
    avatars: ["/Image /image 116.svg", "/Image /image 117.svg", "/Image /image 119.svg"]
  },
  partneredBy: { logos: [] },
  whatWeDo: { title: "WHAT WE DO", items: [] },
  workshop: { title: "ROBOTICS CORE WORKSHOP - 2.0" },
  testimonials: {
    title: "PROOF THAT WE DELIVER",
    subtitle: "Real results from our students",
    leadQuote: "This program transformed my robotics career.",
    heroVideo: "https://cdn.example.com/videos/success.mp4",
    heroPoster: "https://cdn.example.com/images/success-poster.jpg",
    heroImage: "https://cdn.example.com/images/success-fallback.jpg",
    featuredIndex: 0,
    items: [
      {
        name: "Amara K.",
        role: "Alumni, Robotics Engineer",
        avatar: "https://cdn.example.com/avatars/amara.jpg",
        text: "I landed a robotics job 2 weeks after finishing the workshop."
      },
      {
        name: "Deji O.",
        role: "Student",
        avatar: "https://cdn.example.com/avatars/deji.jpg",
        text: "The hands-on projects made complex topics feel easy."
      },
      {
        name: "Zainab A.",
        role: "Mechatronics Graduate",
        avatar: "https://cdn.example.com/avatars/zainab.jpg",
        text: "Best community and mentors—highly recommended!"
      }
    ]
  },
  team: { title: "THE ARCHITECTS OF CREATIVITY", members: [] },
  faq: { title: "FAQ", items: [] }
};
