export type ReviewDummy = {
  icon?: string;
  text: string;
  author: string;
  subtitle?: string;
  avatar?: string;
  size?: "large" | "normal";
  social?: { x?: string; linkedin?: string };
};

export const reviewsDummy: ReviewDummy[] = [
  {
    icon: "linkedin",
    text:
      "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facillis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequntur recusandae.",
    author: "John Ikenna",
    subtitle: "Afe Babalola University",
    avatar: "/Image /image 116.svg",
    size: "large",
  },
  {
    icon: "x",
    text:
      "Lorem ipsum dolor sit amet. consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.",
    author: "John Ikenna",
    subtitle: "Afe Babalola University",
    avatar: "/Image /image 117.svg",
    size: "large",
  },
  {
    icon: "linkedin",
    text:
      "Lorem ipsum dolor sit amet. Et dicta magni ut sint galisum eos temporibus iure non error mollitia eos nihil quia ut praesentium fugiat! Et facillis cumque et ipsam praesentium ut autem nulla est tenetur maxime et consequntur recusandae.",
    author: "John Ikenna",
    subtitle: "Afe Babalola University",
    avatar: "/Image /image 119.svg",
    size: "large",
  },
];
