"use client";

import { Reveal } from "@/components/ui/Reveal";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

/**
 * Curated wall of testimonials. Each entry: a punchy 1-2 sentence quote
 * extracted from the original LinkedIn recommendation, the person's name,
 * and their current role. Layout below uses CSS columns so cards flow
 * naturally based on quote length (true masonry, no JS).
 */
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Phil stands out as an extraordinarily skilled and professional UI/UX design leader. His expertise is particularly evident in complex, challenging projects.",
    name: "Pavel Petroshenko",
    role: "VP of Product Management at Azul",
  },
  {
    quote:
      "Phil is in a league of his own. A true embodiment of agile principles who knows how to attract a team's attention and energy to the outcomes that matter.",
    name: "David Kendall",
    role: "Product Leader · 0→1 Innovation · AI/ML",
  },
  {
    quote:
      "A phenomenally talented and knowledgeable designer who passed on so many points of insight and wisdom during our time together.",
    name: "Robert Sosin",
    role: "Senior Conversation Designer · UX + AI",
  },
  {
    quote:
      "Phil was instrumental in helping us develop our design practice. He set a high bar for what quality and effective product design looks like.",
    name: "Isabelle Berner",
    role: "AI Product Leader · Ex-Pivotal Labs",
  },
  {
    quote:
      "Extremely user-focused. Thoughtful about each detail and able to explain his design decisions. A supportive co-worker who takes time to connect.",
    name: "Shani Abada, PhD",
    role: "Executive Director, Conversational AI at JP Morgan Chase",
  },
  {
    quote:
      "A great asset for a design and cross-functional team. Phil provided support across projects and was actively involved in hiring.",
    name: "Froso Ellina",
    role: "Design Manager at Google",
  },
  {
    quote:
      "A capable and thoughtful design leader. Phil delivered our first user research-led improvements and led our first multi-disciplinary discovery efforts.",
    name: "Kevin Olsen",
    role: "GM EMEA at Mechanical Orchard",
  },
  {
    quote:
      "One of the best designers I have worked with. Both approachable and easy to work with. His deep understanding of design contributed greatly to our mobile apps.",
    name: "Wesley Siu",
    role: "VP of Product Management",
  },
  {
    quote:
      "Not only a great leader, but also a good friend and mentor. He gave me the freedom to do my best work and was always available when I needed help.",
    name: "Israel Mesquita",
    role: "AI UX/UI Designer at George Labs",
  },
  {
    quote:
      "A designer who doesn't worry about design — his main concern is making work that brings results. He's one of those guys you need when you want to make things really happen.",
    name: "Jon Vieira",
    role: "Product Design Lead at Meta Reality Labs",
  },
  {
    quote:
      "A calm presence, communicates clearly, offers great insights, and leads excellent workshops. He made significant improvements to our user-research processes.",
    name: "Daniel Kift",
    role: "Senior Software Engineer at Shopify",
  },
  {
    quote:
      "Phil brought clear design direction to the team and helped steer products in the right direction. His calm, pragmatic approach was invaluable.",
    name: "Andrea Nagel",
    role: "Product Manager at Intercom",
  },
  {
    quote:
      "Phil ramped up super quickly. As a product manager, pressure from stakeholders dropped, velocity recovered, and team morale went up.",
    name: "Vitor Kneipp",
    role: "Senior Product Manager · Decisioning",
  },
  {
    quote:
      "What sets Phil apart is his strong business acumen. When he designs a product, he considers every possible impact on the business.",
    name: "Martin J. Stojka",
    role: "CEO at Jimmy Technologies",
  },
  {
    quote:
      "A high level of professionalism in his designs, work and ethics. He helped our team think out of the box and challenge the status-quo on Cemex's digital transformation.",
    name: "Alejandro Cruz",
    role: "Business Operations · Agile Transformation",
  },
  {
    quote:
      "Standout talent. I was particularly impressed by Phil's ability to handle even the toughest UI projects, effortlessly. He earns my highest recommendation.",
    name: "Rafael Fidalgo",
    role: "Senior Manager at Accenture",
  },
  {
    quote:
      "If you want your product to succeed, you want Phil on your team. With conversion and results in mind, he can take any failing product and bring it back to life.",
    name: "Sean Berg",
    role: "Senior UX Designer at Workday",
  },
  {
    quote:
      "I highly recommend Phil as a passionate and experienced Interaction Designer to any company that wants a leader on its team.",
    name: "Filipe Marques",
    role: "Staff Product Designer · UX Strategy",
  },
  {
    quote:
      "I highly recommend Phil to any company looking for a passionate UX Designer with global experience, robust processes, and a drive for innovation.",
    name: "Demian Borba",
    role: "Founder & CEO at Pactto",
  },
  {
    quote:
      "Phil is certainly the best designer I'd ever worked with. Creative, fast and assertive. With him on the project, you don't need to worry — you'll get the best result.",
    name: "Bruno Fisbhen",
    role: "Founder & CEO at ColaboraApp",
  },
  {
    quote:
      "Super helpful and insightful. He lives the mantra of Be Kind. I'd love to work again with Phil should our paths cross.",
    name: "Steven Moyes",
    role: "Creative · Innovative · Disruptive",
  },
  {
    quote:
      "A great designer who knows what's needed and when. Phil leads design exercises with high professionalism, especially in challenging projects.",
    name: "Othman Alkhamra",
    role: "Software Engineer at Marex",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-32 px-6 md:px-12 lg:px-24 relative z-10 border-t border-white/5"
    >
      <Reveal>
        <div className="flex items-center gap-4 mb-12">
          <div className="w-2 h-2 rounded-full bg-[#0f62fe] shadow-[0_0_10px_rgba(15,98,254,0.8)]" />
          <h2 className="font-mono text-xs md:text-sm font-medium tracking-[0.22em] uppercase text-zinc-400">
            What Leaders Say
          </h2>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <h3 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-white tracking-tight max-w-4xl mb-20">
          Trusted by people who&apos;ve shipped at the{" "}
          <span className="shine-text italic font-serif">highest level</span>.
        </h3>
      </Reveal>

      {/* CSS columns masonry: cards flow naturally to the next column when
          the current one's content height is reached, so quote-length
          variation produces a tight, organic wall instead of awkward
          fixed-height grid gaps. */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-7">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 30}>
            <figure className="group relative break-inside-avoid mb-6 md:mb-7 glass rounded-2xl p-7 md:p-8 border-white/5 hover:border-[#0f62fe]/30 hover:shadow-[0_8px_30px_rgba(15,98,254,0.10)] transition-all duration-500 will-change-transform">
              {/* Subtle blue accent corner */}
              <span
                aria-hidden
                className="absolute top-5 right-5 w-1.5 h-1.5 rounded-full bg-[#0f62fe]/60 group-hover:bg-[#0f62fe] transition-colors"
              />
              <blockquote className="text-zinc-200 font-light text-[15px] md:text-base leading-relaxed mb-6">
                {t.quote}
              </blockquote>
              <figcaption className="flex flex-col gap-1 pt-4 border-t border-white/8">
                <span className="text-white font-medium text-sm tracking-wide">
                  {t.name}
                </span>
                <span className="font-mono text-[10px] font-medium tracking-[0.16em] uppercase text-zinc-400 leading-snug">
                  {t.role}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
