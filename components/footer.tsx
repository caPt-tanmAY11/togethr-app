export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Top glow */}
      <div className="absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Glass background */}
      <div className="relative backdrop-blur-2xl bg-black/95 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-14">
          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-white/80">
            {/* Brand */}
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-wide">
                togethr<span className="text-white/60">.</span>
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-sm">
                Helping students, developers, and builders find hackathon
                teammates and project collaborators - faster, smarter, togethr.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                Explore
              </h3>

              <ul className="mt-5 space-y-3 text-sm">
                {[
                  { label: "Hackathon Teams", href: "/main/hacks-teamup" },
                  { label: "Projects", href: "/main/projects" },
                  { label: "Create Team", href: "/main/hacks-teamup/create" },
                  { label: "Create Project", href: "/main/projects/create" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="group inline-flex items-center gap-1
                      text-white/60 hover:text-white transition"
                    >
                      <span className="h-px w-0 bg-white transition-all duration-300 group-hover:w-3" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social / Meta */}
            <div>
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                Connect
              </h3>

              <ul className="mt-5 space-y-3 text-sm">
                {[
                  { label: "GitHub", href: "https://github.com/caPt-tanmAY11" },
                  {
                    label: "LinkedIn",
                    href: "https://www.linkedin.com/in/tanmay-vishwakarma-a1363a2a8/",
                  },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="group inline-flex items-center gap-1
                      text-white/60 hover:text-white transition"
                    >
                      <span className="h-px w-0 bg-white transition-all duration-300 group-hover:w-3" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              <ul className="mt-5 space-y-3 text-sm">
                <li className="text-white/50 px-1">tanmay06lko@gmail.com</li>
                <li className="text-white/50 px-1">9321699208</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-14 pt-6 border-t border-white/10
            flex flex-col sm:flex-row items-center justify-between
            text-xs text-white/40"
          >
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="text-white/60">togethr</span>. All rights
              reserved.
            </p>

            <p className="mt-3 sm:mt-0">
              Built with <span className="text-white/60">🩵</span> by{" "}
              <span className="text-white/60 font-medium">
                Tanmay Vishwakarma
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
