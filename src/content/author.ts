// Facts about the author. Mirrors the author's portfolio (viraj-verse), which is the source of
// truth: update it there first, then here.

export const author = {
  name: "Viraj Nalbalwar",
  short: "Viraj",
  location: "Pune, Maharashtra, India",
  tagline: "Cloud and systems engineer. I build, and measure, how shared machines behave under load.",
  photo: "/viraj-nalbalwar.jpg",
  photoAlt: "Viraj Nalbalwar smiling in a striped knit shirt",
  portfolio: "https://viraj-verse.vercel.app",
  contact: "https://viraj-verse.vercel.app/#contact",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/VNalbalwar" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/viraj-nalbalwar-895365255/" },
  { label: "Hashnode", href: "https://viraj-verse.hashnode.dev/" },
  { label: "Instagram", href: "https://www.instagram.com/viraj_nalbalwar/" },
];

export const bio = [
  "I like it when systems misbehave. A cluster that slows down for no reason, a noisy neighbour on a shared GPU, a Linux box that was fine until it wasn't. I keep poking until I know why, then I build the thing that doesn't break that way again.",
  "Mostly that means Kubernetes, Linux and cloud infrastructure, with enough front-end taste that what I ship is nice to use too. Away from the keyboard it's Arch setups and Rubik's cubes.",
];

export const facts: [string, string][] = [
  ["Based in", "Pune, Maharashtra"],
  ["Studying", "B.Tech in Computer Engineering, COEP Technological University (2024 to 2027)"],
  ["Earlier", "Diploma in Computer Engineering, gold medal and state rank 2"],
  ["Certified", "Red Hat Certified System Administrator (RHCSA)"],
];

export const experience = [
  {
    role: "Software Engineer Intern",
    org: "Mastercard",
    when: "May to Jul 2026",
    note: "Built Apache Spark and Spring Boot services that migrate enterprise financial data from legacy DB2 systems to Oracle.",
  },
  {
    role: "Cloud Intern",
    org: "Jio Platforms",
    when: "Jun to Jul 2025",
    note: "Set up a multi-node OpenStack cloud on RHEL and Ubuntu, and ran Docker and Kubernetes workloads with Prometheus and Grafana monitoring.",
  },
  {
    role: "Responsive Web Design Intern",
    org: "SEED Infotech",
    when: "Jun to Jul 2023",
    note: "Built production web interfaces in Next.js, React and Tailwind CSS.",
  },
];

export const research = [
  {
    title: "Characterizing Performance Recovery After Transient GPU Resource Interference",
    venue: "IEEE HiPC 2026, Student Research Symposium (accepted)",
    question: "When a noisy neighbour stops hammering a shared GPU, does your workload recover at once, or does the slowdown linger?",
    href: "https://github.com/VNalbalwar/gpu-recovery-experiment",
  },
  {
    title: "Thermal-Aware Core-Level Scheduling for Kubernetes Workloads",
    venue: "EESP workshop at ISC High Performance 2026 (presented)",
    question: "The most capable core is not always the right one for the next pod. Can a scheduler read each core's temperature before placing it?",
    href: "https://github.com/VNalbalwar/static-thermal-aware-scheduler-phase-1",
  },
];
