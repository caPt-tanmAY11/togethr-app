"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut, User, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "./use-avatar";
import { MessageSquare } from "lucide-react";
import { useFeedback } from "@/components/feeback/feedback-context";
import { createPortal } from "react-dom";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [signoutModalOpen, setSignoutModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session, isPending } = authClient.useSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!session;
  const user = session?.user;
  const slug = user?.slug;

  const { openFeedback } = useFeedback();

  const isProjects = pathname.startsWith("/main/projects");

  const themeColor = isProjects ? "#f36262" : "#27b49c";
  const themeHover = isProjects ? "#fc8e8e" : "#2fd3b6";

  let btnMain = "#236565";
  let btnHover = "#2f8787";

  if (pathname.startsWith("/main/projects")) {
    btnMain = "#f36262b7";
    btnHover = "#fc8e8eb7";
  }

  const createConfig = (() => {
    if (pathname.startsWith("/main/hacks-teamup")) {
      return { label: "Create Team", href: "/main/hacks-teamup/create" };
    }
    if (pathname.startsWith("/main/projects")) {
      return { label: "Create Project", href: "/main/projects/create" };
    }
    return null;
  })();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setSignoutModalOpen(false);
    router.push("/auth/signin");
  };

  const navLinks = [
    { name: "Hacks", href: "/main/hacks-teamup" },
    { name: "Projects", href: "/main/projects" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full h-16 z-998
        backdrop-blur-xl bg-[#0000007d] border-b border-white/10
        flex items-center justify-between px-6 sm:px-10 font-inter"
      >
        <Link
          href="/"
          className="text-white font-bold text-xl flex items-center gap-1"
        >
          togethr
          <span style={{ color: themeColor }}>.</span>
        </Link>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-3">
          <motion.div
            key={themeColor}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
            w-44 h-10 rounded-full blur-3xl pointer-events-none"
            style={{
              background: themeColor,
              opacity: 0.25,
            }}
          />

          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-5 py-2 rounded-full overflow-hidden"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                    className="absolute inset-0 rounded-full -z-10"
                    style={{
                      background: themeColor,
                      boxShadow: `
                        0 0 25px ${themeColor},
                        0 0 50px ${themeColor}55
                      `,
                      filter: "blur(8px)",
                      opacity: 0.9,
                    }}
                  ></motion.div>
                )}

                <motion.span
                  animate={{
                    y: isActive ? -1 : 0,
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`relative z-10 font-medium transition-colors ${
                    isActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </motion.span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4 relative">
          {createConfig && (
            <Link
              href={createConfig.href}
              className={`flex items-center font-semibold gap-2 px-4 py-1.5 rounded-md text-sm
              text-white transition-all bg-[${btnMain}] hover:bg-[${btnHover}]`}
            >
              <Plus size={16} />
              {createConfig.label}
            </Link>
          )}

          {!isPending && isAuthenticated && (
            <button
              onClick={openFeedback}
              className="flex items-center gap-2
  text-gray-300 hover:text-white
  text-sm px-4 py-1.5 rounded-md bg-white/10
  hover:bg-white/20 cursor-pointer font-semibold"
            >
              <MessageSquare size={16} />
              Feedback
            </button>
          )}

          {!isPending &&
            (isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="rounded-full overflow-hidden border border-white/20 cursor-pointer"
                >
                  <UserAvatar
                    image={user?.image}
                    name={user?.name}
                    className="w-9 h-9"
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 rounded-xl
                      bg-[#0f0f0f] backdrop-blur-2xl border border-white/10 p-4 z-50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <UserAvatar
                          image={user?.image}
                          name={user?.name}
                          className="w-10 h-10"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {user?.name}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="h-px bg-white/10 my-3" />

                      <button
                        onClick={() => {
                          router.push(`/main/profile/${slug}`);
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 text-sm text-gray-300
                        hover:text-white hover:bg-white/5 px-2 py-2 rounded-lg cursor-pointer"
                      >
                        <User size={16} />
                        View Profile
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setSignoutModalOpen(true);
                        }}
                        className="flex items-center gap-2 text-sm text-red-400 w-full
                        hover:bg-red-500/5 px-2 py-2 rounded-lg cursor-pointer"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center gap-2
  text-gray-300 hover:text-white
  text-sm px-4 py-1.5 rounded-2xl bg-white/10
  hover:bg-white/20 cursor-pointer font-semibold"
              >
                Sign in
              </Link>
            ))}
        </div>
        <button
          onClick={() => setMobileMenuOpen((p) => !p)}
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {signoutModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-998 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-0"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  className="bg-zinc-950 border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm"
                >
                  <h2 className="text-white font-semibold text-lg sm:text-xl">
                    Sign out?
                  </h2>
                  <p className="text-gray-400 text-sm mt-2 sm:mt-3 break-words">
                    You’ll be logged out.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 sm:mt-6">
                    <button
                      onClick={() => setSignoutModalOpen(false)}
                      className="text-gray-400 hover:text-white cursor-pointer w-full sm:w-auto text-center"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSignOut}
                      className={`px-4 py-2 rounded-lg text-white cursor-pointer w-full sm:w-auto text-center bg-[${btnMain}] hover:bg-[${btnHover}]`}
                    >
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[999] md:hidden
      bg-gradient-to-b from-black/95 to-black/90
      backdrop-blur-2xl"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 p-3 rounded-full
        bg-white/10 hover:bg-white/20 text-white
        backdrop-blur-xl transition"
            >
              <X size={24} />
            </motion.button>

            <div className="h-full w-full flex flex-col px-6 pt-24 pb-8">
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: { staggerChildren: 0.08 },
                  },
                }}
                className="flex flex-col gap-5"
              >
                {navLinks.map((link) => {
                  const active = pathname.startsWith(link.href);

                  return (
                    <motion.div
                      key={link.name}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0 },
                      }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <motion.div
                        key={link.name}
                        variants={{
                          hidden: { opacity: 0, y: 12 },
                          show: { opacity: 1, y: 0 },
                        }}
                        whileTap={{ scale: 0.96 }}
                        className="relative"
                      >
                        {active && (
                          <motion.div
                            layoutId="mobile-active-pill"
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 30,
                            }}
                            className="absolute inset-0 rounded-2xl
      bg-white/10 backdrop-blur-xl"
                          />
                        )}

                        {active && (
                          <motion.div
                            layoutId="mobile-active-bar"
                            className="absolute left-0 top-1/2 -translate-y-1/2
      h-8 w-1 rounded-full bg-white"
                          />
                        )}

                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`relative z-10 flex items-center
    px-5 py-4 text-2xl font-semibold tracking-wide
    rounded-2xl transition-colors
    ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <div className="mt-12 flex flex-col gap-4">
                {createConfig && (
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Link
                      href={createConfig.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-center gap-2
                text-lg px-5 py-3 rounded-2xl text-white
                bg-[${btnMain}] hover:bg-[${btnHover}]`}
                    >
                      <Plus size={18} />
                      {createConfig.label}
                    </Link>
                  </motion.div>
                )}

                {!isPending && isAuthenticated && (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        openFeedback();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2
            text-lg px-5 py-3 rounded-2xl
            text-gray-300 hover:text-white
            bg-white/10 hover:bg-white/20"
                    >
                      <MessageSquare size={18} />
                      Feedback
                    </motion.button>
                  </>
                )}
              </div>

              <div
                className="mt-auto pt-10 border-t border-white/10
        flex flex-col gap-5"
              >
                {!isPending &&
                  (isAuthenticated ? (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          router.push(`/main/profile/${slug}`);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 text-lg
                  text-gray-300 hover:text-white"
                      >
                        <User size={18} />
                        View Profile
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setSignoutModalOpen(true);
                        }}
                        className="flex items-center gap-3 text-lg text-red-400"
                      >
                        <LogOut size={18} />
                        Sign out
                      </motion.button>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg text-gray-300 hover:text-white"
                    >
                      Sign in
                    </Link>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
