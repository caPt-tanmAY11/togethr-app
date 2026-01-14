"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChangePasswordModal from "@/components/auth/change-password-modal";
import SkillStackSection from "@/components/skill-stack-section";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ProfileSettingsSkeleton from "@/components/skeletons/profile-settings-skeleton";

interface ProfileResponse {
  name: string;
  headline: string | null;
  organization: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  about: string | null;

  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  XUrl: string | null;

  skills: string[];

  education: {
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startYear: string | null;
    endYear: string | null;
    grade: string | null;
    description: string | null;
  }[];

  achievements: {
    title: string;
    description: string | null;
    issuer: string | null;
    issuedAt: string | null;
    category: string | null;
    proofUrl: string | null;
  }[];
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [hasPassword, setHasPassword] = useState(false);

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [organization, setOrganization] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [about, setAbout] = useState("");

  const [linkedinUrl, setLinkedInUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [XUrl, setXUrl] = useState("");

  const [skills, setSkills] = useState<string[]>([]);

  const [education, setEducation] = useState<ProfileResponse["education"]>([]);
  const [achievements, setAchievements] = useState<
    ProfileResponse["achievements"]
  >([]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile/update");
        const data = await res.json();

        if (!res.ok || !data.profile) {
          throw new Error("Invalid profile response");
        }

        const profile: ProfileResponse = data.profile;

        setName(profile.name ?? "");
        setHeadline(profile.headline ?? "");
        setOrganization(profile.organization ?? "");
        setLocationCity(profile.locationCity ?? "");
        setLocationCountry(profile.locationCountry ?? "");
        setAbout(profile.about ?? "");

        setLinkedInUrl(profile.linkedinUrl ?? "");
        setGithubUrl(profile.githubUrl ?? "");
        setPortfolioUrl(profile.portfolioUrl ?? "");
        setXUrl(profile.XUrl ?? "");

        setSkills(profile.skills ?? []);

        setEducation(profile.education ?? []);
        setAchievements(profile.achievements ?? []);

        setHasPassword(data.hasPassword);
      } catch {
        toast.error("Failed to load profile data");
      } finally {
        setInitialLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanedSkills = skills.map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          headline: headline || null,
          organization: organization || null,
          locationCity: locationCity || null,
          locationCountry: locationCountry || null,
          about: about || null,

          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          portfolioUrl: portfolioUrl || null,
          XUrl: XUrl || null,

          skills: cleanedSkills,

          education,
          achievements,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Profile updated successfully");
      router.push(`/main/profile/${session?.user.slug}`);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  function handleSetPassword() {
    router.push("/auth/forgot-password?set-password=true");
  }

  if (initialLoading) {
    return <ProfileSettingsSkeleton />;
  }
  return (
    <>
      <form
        onSubmit={handleUpdate}
        className="mx-auto max-w-3xl space-y-10 text-white my-20"
      >
        <Section title="Profile">
          <div className="space-y-4 sm:space-y-5">
            <Input label="Name" value={name} onChange={setName} />

            <Input label="Headline" value={headline} onChange={setHeadline} />

            <Input
              label="Organization"
              value={organization}
              onChange={setOrganization}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Input
                label="City"
                value={locationCity}
                onChange={setLocationCity}
              />

              <Input
                label="Country"
                value={locationCountry}
                onChange={setLocationCountry}
              />
            </div>

            <Textarea label="About" value={about} onChange={setAbout} />
          </div>
        </Section>

        <Section title="Social Links">
          <div className="space-y-4 sm:space-y-5">
            <Input
              label="LinkedIn"
              value={linkedinUrl}
              onChange={setLinkedInUrl}
            />

            <Input label="GitHub" value={githubUrl} onChange={setGithubUrl} />

            <Input label="X" value={XUrl} onChange={setXUrl} />

            <Input
              label="Portfolio"
              value={portfolioUrl}
              onChange={setPortfolioUrl}
            />
          </div>
        </Section>

        <Section title="Skills">
          <SkillStackSection
            section="hack-teams"
            elements={skills}
            setElements={setSkills}
            type="skillstack"
          />
        </Section>

        <Section title="Education">
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div
                key={index}
                className="space-y-4 border-b border-white/10 pb-6"
              >
                <Input
                  label="Institution"
                  value={edu.institution}
                  onChange={(val) => {
                    const newEdu = [...education];
                    newEdu[index].institution = val;
                    setEducation(newEdu);
                  }}
                />

                <Input
                  label="Degree"
                  value={edu.degree ?? ""}
                  onChange={(val) => {
                    const newEdu = [...education];
                    newEdu[index].degree = val;
                    setEducation(newEdu);
                  }}
                />

                <Input
                  label="Field of Study"
                  value={edu.fieldOfStudy ?? ""}
                  onChange={(val) => {
                    const newEdu = [...education];
                    newEdu[index].fieldOfStudy = val;
                    setEducation(newEdu);
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Year"
                    value={edu.startYear ?? ""}
                    onChange={(val) => {
                      const newEdu = [...education];
                      newEdu[index].startYear = val;
                      setEducation(newEdu);
                    }}
                  />

                  <Input
                    label="End Year"
                    value={edu.endYear ?? ""}
                    onChange={(val) => {
                      const newEdu = [...education];
                      newEdu[index].endYear = val;
                      setEducation(newEdu);
                    }}
                  />
                </div>

                <Input
                  label="Grade"
                  value={edu.grade ?? ""}
                  onChange={(val) => {
                    const newEdu = [...education];
                    newEdu[index].grade = val;
                    setEducation(newEdu);
                  }}
                />

                <Textarea
                  label="Description"
                  value={edu.description ?? ""}
                  onChange={(val) => {
                    const newEdu = [...education];
                    newEdu[index].description = val;
                    setEducation(newEdu);
                  }}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Achievements">
          <div className="space-y-6">
            {achievements.map((ach, index) => (
              <div
                key={index}
                className="space-y-4 border-b border-white/10 pb-6"
              >
                <Input
                  label="Title"
                  value={ach.title}
                  onChange={(val) => {
                    const newAch = [...achievements];
                    newAch[index].title = val;
                    setAchievements(newAch);
                  }}
                />

                <Input
                  label="Issuer"
                  value={ach.issuer ?? ""}
                  onChange={(val) => {
                    const newAch = [...achievements];
                    newAch[index].issuer = val;
                    setAchievements(newAch);
                  }}
                />

                <Input
                  label="Category"
                  value={ach.category ?? ""}
                  onChange={(val) => {
                    const newAch = [...achievements];
                    newAch[index].category = val;
                    setAchievements(newAch);
                  }}
                />

                <Textarea
                  label="Description"
                  value={ach.description ?? ""}
                  onChange={(val) => {
                    const newAch = [...achievements];
                    newAch[index].description = val;
                    setAchievements(newAch);
                  }}
                />

                <Input
                  label="Proof URL"
                  value={ach.proofUrl ?? ""}
                  onChange={(val) => {
                    const newAch = [...achievements];
                    newAch[index].proofUrl = val;
                    setAchievements(newAch);
                  }}
                />
              </div>
            ))}
          </div>
        </Section>

        <button
          disabled={loading}
          className="auth-form-main-btn w-full py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <Section title="Security">
          <div
            className="flex flex-col sm:flex-row
      items-start sm:items-center
      justify-between gap-4 sm:gap-6"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {hasPassword ? "Password" : "Set up a password"}
              </p>

              <p className="text-sm text-white/60 max-w-md">
                {hasPassword
                  ? "Change your account password to keep your account secure."
                  : "You signed up using OAuth. Set a password to enable email & password login."}
              </p>
            </div>

            {hasPassword ? (
              <button
                type="button"
                onClick={() => setOpenPasswordModal(true)}
                className="w-full sm:w-auto
          px-4 py-2 text-sm rounded-lg border border-white/15
          hover:border-red-400/60 hover:text-red-300
          transition-colors cursor-pointer"
              >
                Change password
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSetPassword}
                className="w-full sm:w-auto
          px-4 py-2 text-sm rounded-lg
          bg-teal-500/10 text-teal-300
          hover:bg-teal-500/20 transition-colors cursor-pointer"
              >
                Set password
              </button>
            )}
          </div>
        </Section>
      </form>

      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />
    </>
  );
}


function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-white/60">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 px-3 py-2 rounded-md outline-none text-white focus:ring-1 focus:ring-teal-600 border border-white/15"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-white/60">{label}</label>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 px-3 py-2 rounded-md outline-none text-white border border-white/15 focus:ring-1 focus:ring-teal-600 resize-none"
      />
    </div>
  );
}
