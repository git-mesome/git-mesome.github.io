export interface BasicInfo {
  name: string;
  tagline: string;
  email: string;
  github: string;
  linkedin: string;
}

export interface Career {
  company: string;
  period: string;
  role: string;
  team: string;
}

export interface Education {
  school: string;
  period: string;
  degree: string;
}

export interface Certificate {
  name: string;
  date: string;
  issuer: string;
}

export const basicInfo: BasicInfo = {
  name: "[TODO]",
  tagline: "[TODO] 직무 + 철학 한 줄",
  email: "[TODO]",
  github: "[TODO]",
  linkedin: "[TODO]",
};

export const careers: Career[] = [
  {
    company: "[TODO]",
    period: "[TODO]",
    role: "[TODO]",
    team: "[TODO]",
  },
];

export const skills: string[] = ["[TODO]"];

export const education: Education[] = [
  {
    school: "[TODO]",
    period: "[TODO]",
    degree: "[TODO]",
  },
];

export const certificates: Certificate[] = [
  {
    name: "[TODO]",
    date: "[TODO]",
    issuer: "[TODO]",
  },
];
