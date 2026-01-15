import Link from "next/link";

interface ProjectCardProps {
  projectId: string;
  title: string;
  shortDesc: string;
  stage: "IDEA" | "BUILDING" | "MVP" | "LIVE";
  skillStack: string[];
  commitment: "LOW" | "MEDIUM" | "HIGH";
  tags: string[];
  currentMembers: number;
}

export default function ProjectCard({
  projectId,
  title,
  shortDesc,
  stage,
  skillStack,
  commitment,
  tags,
  currentMembers,
}: ProjectCardProps) {
  return (
    <>
      <div className="flex flex-col gap-5 p-6 pb-16">
        <div className="flex flex-col gap-3 font-inter">
          <h1 className="text-xl font-semibold text-white/90 tracking-wide wrap-break-word">
            {title}
          </h1>

          <p className="text-base font-medium text-white/80">
            Stage: <span className="text-[#f36262] font-semibold">{stage}</span>
          </p>
        </div>

        <div className="bg-white/5 flex flex-col gap-3 py-4 px-4 rounded-lg border border-white/10 shadow-inner">
          <p className="text-sm text-[#a1a1a1] leading-relaxed break-words whitespace-pre-line">
            {shortDesc.length > 90 ? shortDesc.slice(0, 90) + "..." : shortDesc}
          </p>

          <p className="text-sm font-semibold text-white/90 mt-2">
            Commitment:{" "}
            <span className="text-[#f36262] font-bold">{commitment}</span>
          </p>

          <div>
            <p className="text-sm font-semibold text-white/90">
              Required skill stack:
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {skillStack.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="text-sm text-[#f36262] font-medium mr-1"
                >
                  {skill}
                </span>
              ))}
              {skillStack.length > 3 && (
                <span className="text-[#7c7c7c] text-xs">
                  +{skillStack.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="font-inter text-sm px-1">
          <p>
            Contributors:{" "}
            <span className="font-medium text-[#f36262]">{currentMembers}</span>
          </p>

          <p className="mt-3">Tags:</p>
          <div className="flex flex-wrap gap-2 mt-2 max-w-full">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-white/5 border border-white/10 text-xs px-3 py-1 rounded-lg text-[#cfcfcf]"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[#7c7c7c] text-xs">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5">
        <Link
          href={`/main/projects/${projectId}`}
          className="
            bg-[#f36262b7]
            py-2 px-5
            text-sm rounded-md
            hover:bg-[#fc8e8eb7]
            transition-all
            font-medium
            shadow-md
          "
        >
          View Details
        </Link>
      </div>
    </>
  );
}
