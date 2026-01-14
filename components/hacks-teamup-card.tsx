import Link from "next/link";
import { formatHackathonDates } from "@/lib/utils";
import Image from "next/image";

interface HacksTeamCardProps {
  teamId: string;
  teamName: string;
  teamOrigin: string;
  hackName: string;
  hackPlace: string;
  hackMode: string;
  hackBegins: string;
  hackEnds: string;
  teamSize: number;
  requirements: string[];
  image?: string;
}

export default function HacksTeamupCard({
  teamId,
  teamName,
  teamOrigin,
  hackName,
  hackPlace,
  hackMode,
  hackBegins,
  hackEnds,
  teamSize,
  requirements,
  image,
}: HacksTeamCardProps) {
  const blurred = image?.replace("/upload/", "/upload/e_blur:200,q_1/");

  return (
    <>
      <div className="flex flex-col gap-5 p-6 pb-16">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-lg border border-white/10 overflow-hidden bg-white/5">
            {image ? (
              <Image
                src={image.replace("/upload/", "/upload/c_fill,w_160,h_160/")}
                alt={`${teamName} logo`}
                width={80}
                height={80}
                className="object-cover h-full w-full"
                placeholder="blur"
                blurDataURL={blurred}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[#cfcfcf]">
                IMG
              </div>
            )}
          </div>

          <div className="font-inter">
            <h1 className="text-xl font-bold text-white/90 tracking-wide">
              {teamName}
            </h1>
            <p className="text-[#4ff1f1b7] font-semibold text-sm max-w-55 wrap-break-word">
              ({teamOrigin})
            </p>
          </div>
        </div>

        <div className="bg-white/5 flex flex-col gap-2 font-inter py-4 px-4 rounded-lg border border-white/10 shadow-inner">
          <div>
            <h2 className="font-semibold text-base">{hackName}</h2>
            <p className="text-sm text-[#a1a1a1] mt-0.5">({hackPlace})</p>
          </div>
          <p className="text-sm">
            Mode:{" "}
            <span className="font-semibold text-[#4ff1f1b7]">{hackMode}</span>
          </p>
          <p className="text-sm">
            Date:{" "}
            <span className="text-[#ffffffa8] font-semibold">
              {formatHackathonDates(hackBegins, hackEnds)}
            </span>
          </p>
        </div>

        <div className="font-inter text-sm px-1">
          <p className="font-medium">
            Team Size:{" "}
            <span className="font-semibold text-[#4ff1f1b7]">{teamSize}</span>
          </p>
          <p className="mt-2 font-medium">Requirements:</p>
          <div className="flex flex-wrap gap-2 mt-2 max-w-64">
            {requirements.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="bg-white/5 font-medium border border-white/10 text-xs px-3 py-1 rounded-lg text-[#cfcfcf]"
              >
                {skill}
              </span>
            ))}
            {requirements.length > 3 && (
              <span className="text-[#7c7c7c] text-xs">
                +{requirements.length - 3} more...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 font-inter">
        <Link
          href={`/main/hacks-teamup/${teamId}`}
          className="bg-[#236565] py-2 px-5 text-sm rounded-md hover:bg-[#2f8787] transition-all font-medium shadow-md"
        >
          View Details
        </Link>
      </div>
    </>
  );
}
