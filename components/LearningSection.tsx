"use client";

const learningPoints = [
  {
    number: "01",
    title: "The Art of the Start",
    description:
      "Master the fundamentals of launching a successful business from the ground up, even with limited resources.",
  },
  {
    number: "02",
    title: "Growth Hacking",
    description:
      "Learn unconventional, creative strategies for rapid business growth and customer acquisition.",
  },
  {
    number: "03",
    title: "Scaling Up",
    description:
      "Discover how to take your business to the next level with proven scaling techniques and frameworks.",
  },
];

export default function LearningSection() {
  return (
    <section className="bg-black py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            WHAT YOU'LL LEARN
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Our comprehensive curriculum is designed to transform your
            entrepreneurial journey with actionable insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-800">
          {learningPoints.map((item, index) => (
            <div
              key={index}
              className="p-8 group hover:bg-gray-900/50 transition-colors duration-300"
            >
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                {item.number}
              </span>
              <h3 className="text-xl font-bold text-white mt-4 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
