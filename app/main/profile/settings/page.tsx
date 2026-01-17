"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ChangePasswordModal from "@/components/auth/change-password-modal";
import SkillStackSection from "@/components/skill-stack-section";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ProfileSettingsSkeleton from "@/components/skeletons/profile-settings-skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const cachedData = queryClient.getQueryData<{
    profile: ProfileResponse;
    hasPassword: boolean;
  }>(["profile-update-data"]);

  const [hasPassword, setHasPassword] = useState(
    cachedData?.hasPassword ?? false
  );
  const [name, setName] = useState(cachedData?.profile?.name ?? "");
  const [headline, setHeadline] = useState(cachedData?.profile?.headline ?? "");
  const [organization, setOrganization] = useState(
    cachedData?.profile?.organization ?? ""
  );
  const [locationCity, setLocationCity] = useState(
    cachedData?.profile?.locationCity ?? ""
  );
  const [locationCountry, setLocationCountry] = useState(
    cachedData?.profile?.locationCountry ?? ""
  );
  const [about, setAbout] = useState(cachedData?.profile?.about ?? "");
  const [linkedinUrl, setLinkedInUrl] = useState(
    cachedData?.profile?.linkedinUrl ?? ""
  );
  const [githubUrl, setGithubUrl] = useState(
    cachedData?.profile?.githubUrl ?? ""
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    cachedData?.profile?.portfolioUrl ?? ""
  );
  const [XUrl, setXUrl] = useState(cachedData?.profile?.XUrl ?? "");
  const [skills, setSkills] = useState<string[]>(
    cachedData?.profile?.skills ?? []
  );
  const [education, setEducation] = useState<ProfileResponse["education"]>(
    cachedData?.profile?.education ?? []
  );
  const [achievements, setAchievements] = useState<
    ProfileResponse["achievements"]
  >(cachedData?.profile?.achievements ?? []);

  const { data: freshData, isLoading: initialLoading } = useQuery({
    queryKey: ["profile-update-data"],
    queryFn: async () => {
      const res = await fetch("/api/profile/update");
      const data = await res.json();
      if (!res.ok || !data.profile) throw new Error("Invalid profile response");
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (freshData?.profile) {
      const p = freshData.profile;
      setName(p.name ?? "");
      setHeadline(p.headline ?? "");
      setOrganization(p.organization ?? "");
      setLocationCity(p.locationCity ?? "");
      setLocationCountry(p.locationCountry ?? "");
      setAbout(p.about ?? "");
      setLinkedInUrl(p.linkedinUrl ?? "");
      setGithubUrl(p.githubUrl ?? "");
      setPortfolioUrl(p.portfolioUrl ?? "");
      setXUrl(p.XUrl ?? "");
      setSkills(p.skills ?? []);
      setEducation(p.education ?? []);
      setAchievements(p.achievements ?? []);
      setHasPassword(freshData.hasPassword);
    }
  }, [freshData]);

  const { mutate: updateProfile, isPending: loading } = useMutation({
    mutationFn: async () => {
      const cleanedSkills = skills.map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          headline,
          organization,
          locationCity,
          locationCountry,
          about,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
          XUrl,
          skills: cleanedSkills,
          education,
          achievements,
        }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["profile", session?.user.slug],
      });
      queryClient.invalidateQueries({ queryKey: ["navbar-user"] });
      queryClient.invalidateQueries({ queryKey: ["profile-update-data"] });
      router.push(`/main/profile/${session?.user.slug}`);
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile();
  };

  function handleSetPassword() {
    router.push("/auth/forgot-password?set-password=true");
  }

  if (initialLoading && !cachedData) {
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
          className="auth-form-main-btn w-full py-3 rounded-xl disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <Section title="Security">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
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
                className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-white/15 hover:border-red-400/60 hover:text-red-300 transition-colors cursor-pointer"
              >
                Change password
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSetPassword}
                className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 transition-colors cursor-pointer"
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
        rows={7}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 px-3 py-2 whitespace-pre-wrap rounded-md outline-none text-white border border-white/15 focus:ring-1 focus:ring-teal-600 resize-none"
      />
    </div>
  );
}
